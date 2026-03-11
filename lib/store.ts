"use client"

import { create } from "zustand"
import type { Server, Clan, Member, ClanStats, SearchResult, GroundhogRun } from "./types"
import type { ExportData } from "./import-export"

interface AntsStore {
  servers: Server[]
  selectedServerId: string | null
  selectedClanId: string | null
  selectedMemberId: string | null
  isLoading: boolean
  error: string | null

  // Data fetching
  fetchServers: () => Promise<void>
  
  // Server actions
  addServer: (server: Omit<Server, "id" | "clans" | "groundhogRuns">) => Promise<void>
  updateServer: (id: string, updates: Partial<Server>) => Promise<void>
  deleteServer: (id: string) => Promise<void>
  selectServer: (id: string | null) => void

  // Clan actions
  addClan: (serverId: string, clan: Omit<Clan, "id" | "members">) => Promise<void>
  updateClan: (serverId: string, clanId: string, updates: Partial<Clan>) => Promise<void>
  deleteClan: (serverId: string, clanId: string) => Promise<void>
  selectClan: (id: string | null) => void

  // Member actions
  addMember: (serverId: string, clanId: string, member: Omit<Member, "id">) => Promise<void>
  updateMember: (serverId: string, clanId: string, memberId: string, updates: Partial<Member>) => Promise<void>
  deleteMember: (serverId: string, clanId: string, memberId: string) => Promise<void>
  selectMember: (id: string | null) => void
  transferMember: (
    memberId: string,
    fromClanId: string,
    toClanId: string,
    fromServerId: string,
    toServerId: string,
    note?: string,
  ) => Promise<void>
  findMemberByName: (name: string) => { member: Member; serverId: string; clanId: string } | null

  // Computed stats
  getClanStats: (serverId: string, clanId: string) => ClanStats | null
  getServerStats: (serverId: string) => {
    totalMembers: number
    totalClans: number
    totalPower: number
    classDistribution: { G: number; S: number; C: number }
  } | null
  getClanPeakActivity: (serverId: string, clanId: string) => string | null

  // Import/export actions
  exportAll: () => ExportData
  exportServer: (serverId: string) => ExportData | null
  exportClan: (serverId: string, clanId: string) => ExportData | null
  exportMember: (serverId: string, clanId: string, memberId: string) => ExportData | null
  importData: (data: ExportData, overwrite?: boolean) => Promise<{ success: boolean; message: string }>

  search: (query: string) => SearchResult[]
  addGroundhogRun: (serverId: string, date: string, images: string[]) => Promise<void>
  updateGroundhogRun: (serverId: string, runId: string, updates: Partial<GroundhogRun>) => Promise<void>
  deleteGroundhogRun: (serverId: string, runId: string) => Promise<void>
}

function parseTimeRange(activeTime: string): number[] {
  const hours: number[] = []
  const rangeMatch = activeTime.match(/(\d{1,2})(?::00)?[\s\-–—]+(\d{1,2})(?::00)?/)
  if (rangeMatch) {
    const start = Number.parseInt(rangeMatch[1])
    const end = Number.parseInt(rangeMatch[2])
    if (start >= 0 && start <= 23 && end >= 0 && end <= 23) {
      if (start <= end) {
        for (let h = start; h <= end; h++) hours.push(h)
      } else {
        for (let h = start; h <= 23; h++) hours.push(h)
        for (let h = 0; h <= end; h++) hours.push(h)
      }
    }
  }
  const singleMatch = activeTime.match(/\b(\d{1,2})(?::00)?\b/)
  if (singleMatch && hours.length === 0) {
    const hour = Number.parseInt(singleMatch[1])
    if (hour >= 0 && hour <= 23) hours.push(hour)
  }
  return hours
}

export const useAntsStore = create<AntsStore>()((set, get) => ({
  servers: [],
  selectedServerId: null,
  selectedClanId: null,
  selectedMemberId: null,
  isLoading: false,
  error: null,

  fetchServers: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/servers")
      if (!response.ok) {
        if (response.status === 401) {
          set({ servers: [], isLoading: false })
          return
        }
        throw new Error("Failed to fetch servers")
      }
      const servers = await response.json()
      set({ servers, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  addServer: async (server) => {
    try {
      const response = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(server),
      })
      if (!response.ok) throw new Error("Failed to create server")
      const newServer = await response.json()
      set((state) => ({ servers: [...state.servers, newServer] }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  updateServer: async (id, updates) => {
    try {
      const response = await fetch(`/api/servers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error("Failed to update server")
      set((state) => ({
        servers: state.servers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  deleteServer: async (id) => {
    try {
      const response = await fetch(`/api/servers/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete server")
      set((state) => ({
        servers: state.servers.filter((s) => s.id !== id),
        selectedServerId: state.selectedServerId === id ? null : state.selectedServerId,
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  selectServer: (id) => set({ selectedServerId: id, selectedClanId: null, selectedMemberId: null }),

  addClan: async (serverId, clan) => {
    try {
      const response = await fetch(`/api/servers/${serverId}/clans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clan),
      })
      if (!response.ok) throw new Error("Failed to create clan")
      const newClan = await response.json()
      set((state) => ({
        servers: state.servers.map((s) => 
          s.id === serverId ? { ...s, clans: [...s.clans, newClan] } : s
        ),
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  updateClan: async (serverId, clanId, updates) => {
    try {
      const response = await fetch(`/api/servers/${serverId}/clans/${clanId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error("Failed to update clan")
      set((state) => ({
        servers: state.servers.map((s) =>
          s.id === serverId 
            ? { ...s, clans: s.clans.map((c) => (c.id === clanId ? { ...c, ...updates } : c)) } 
            : s,
        ),
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  deleteClan: async (serverId, clanId) => {
    try {
      const response = await fetch(`/api/servers/${serverId}/clans/${clanId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete clan")
      set((state) => ({
        servers: state.servers.map((s) =>
          s.id === serverId ? { ...s, clans: s.clans.filter((c) => c.id !== clanId) } : s,
        ),
        selectedClanId: state.selectedClanId === clanId ? null : state.selectedClanId,
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  selectClan: (id) => set({ selectedClanId: id, selectedMemberId: null }),

  addMember: async (serverId, clanId, member) => {
    try {
      const response = await fetch(`/api/servers/${serverId}/clans/${clanId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(member),
      })
      if (!response.ok) throw new Error("Failed to create member")
      const newMember = await response.json()
      set((state) => ({
        servers: state.servers.map((s) =>
          s.id === serverId
            ? {
                ...s,
                clans: s.clans.map((c) => 
                  c.id === clanId ? { ...c, members: [...c.members, newMember] } : c
                ),
              }
            : s,
        ),
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  updateMember: async (serverId, clanId, memberId, updates) => {
    try {
      const response = await fetch(`/api/servers/${serverId}/clans/${clanId}/members/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error("Failed to update member")
      set((state) => ({
        servers: state.servers.map((s) =>
          s.id === serverId
            ? {
                ...s,
                clans: s.clans.map((c) =>
                  c.id === clanId
                    ? { ...c, members: c.members.map((m) => (m.id === memberId ? { ...m, ...updates } : m)) }
                    : c,
                ),
              }
            : s,
        ),
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  deleteMember: async (serverId, clanId, memberId) => {
    try {
      const response = await fetch(`/api/servers/${serverId}/clans/${clanId}/members/${memberId}`, { 
        method: "DELETE" 
      })
      if (!response.ok) throw new Error("Failed to delete member")
      set((state) => ({
        servers: state.servers.map((s) =>
          s.id === serverId
            ? {
                ...s,
                clans: s.clans.map((c) =>
                  c.id === clanId ? { ...c, members: c.members.filter((m) => m.id !== memberId) } : c,
                ),
              }
            : s,
        ),
        selectedMemberId: state.selectedMemberId === memberId ? null : state.selectedMemberId,
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  selectMember: (id) => set({ selectedMemberId: id }),

  transferMember: async (memberId, fromClanId, toClanId, fromServerId, toServerId, note) => {
    const state = get()
    const fromServer = state.servers.find((s) => s.id === fromServerId)
    const toServer = state.servers.find((s) => s.id === toServerId)
    const fromClan = fromServer?.clans.find((c) => c.id === fromClanId)
    const toClan = toServer?.clans.find((c) => c.id === toClanId)
    const member = fromClan?.members.find((m) => m.id === memberId)

    if (!member || !fromClan || !toClan || !fromServer || !toServer) return

    try {
      const response = await fetch(
        `/api/servers/${fromServerId}/clans/${fromClanId}/members/${memberId}/transfer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toClanId, toServerId }),
        }
      )
      if (!response.ok) throw new Error("Failed to transfer member")

      // Add clan history entry
      const historyEntry = {
        serverNumber: fromServer.serverNumber,
        clanName: fromClan.name,
        clanTag: fromClan.tag,
        endDate: new Date().toISOString(),
        note: note || undefined,
      }

      const updatedMember = {
        ...member,
        clanHistory: [...(member.clanHistory || []), historyEntry],
      }

      set((state) => ({
        servers: state.servers.map((s) => {
          if (s.id === fromServerId) {
            return {
              ...s,
              clans: s.clans.map((c) =>
                c.id === fromClanId ? { ...c, members: c.members.filter((m) => m.id !== memberId) } : c,
              ),
            }
          }
          if (s.id === toServerId) {
            return {
              ...s,
              clans: s.clans.map((c) => 
                c.id === toClanId ? { ...c, members: [...c.members, updatedMember] } : c
              ),
            }
          }
          return s
        }),
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  findMemberByName: (name) => {
    const servers = get().servers
    for (const server of servers) {
      for (const clan of server.clans) {
        const member = clan.members.find((m) => m.name.toLowerCase() === name.toLowerCase())
        if (member) {
          return { member, serverId: server.id, clanId: clan.id }
        }
      }
    }
    return null
  },

  getClanStats: (serverId, clanId) => {
    const server = get().servers.find((s) => s.id === serverId)
    const clan = server?.clans.find((c) => c.id === clanId)
    if (!clan) return null

    const totalMembers = clan.members.length
    if (totalMembers === 0) {
      return { totalMembers: 0, guardPercentage: 0, shooterPercentage: 0, carrierPercentage: 0, totalPower: 0 }
    }

    const classCounts = { G: 0, S: 0, C: 0 }
    let totalPower = 0

    clan.members.forEach((member) => {
      classCounts[member.mainClass]++
      totalPower += member.power || 0
    })

    return {
      totalMembers,
      guardPercentage: (classCounts.G / totalMembers) * 100,
      shooterPercentage: (classCounts.S / totalMembers) * 100,
      carrierPercentage: (classCounts.C / totalMembers) * 100,
      totalPower,
    }
  },

  getServerStats: (serverId) => {
    const server = get().servers.find((s) => s.id === serverId)
    if (!server) return null

    let totalMembers = 0
    let totalPower = 0
    const classCounts = { G: 0, S: 0, C: 0 }

    server.clans.forEach((clan) => {
      clan.members.forEach((member) => {
        totalMembers++
        classCounts[member.mainClass]++
        totalPower += member.power || 0
      })
    })

    return {
      totalMembers,
      totalClans: server.clans.length,
      totalPower,
      classDistribution: classCounts,
    }
  },

  getClanPeakActivity: (serverId, clanId) => {
    const server = get().servers.find((s) => s.id === serverId)
    const clan = server?.clans.find((c) => c.id === clanId)
    if (!clan || clan.members.length === 0) return null

    const hourCounts: Record<number, number> = {}

    clan.members.forEach((member) => {
      if (member.activeTime) {
        const hours = parseTimeRange(member.activeTime)
        hours.forEach((hour) => {
          hourCounts[hour] = (hourCounts[hour] || 0) + 1
        })
      }
    })

    const entries = Object.entries(hourCounts).map(([hour, count]) => ({
      hour: Number.parseInt(hour),
      count,
    }))

    if (entries.length === 0) return null

    entries.sort((a, b) => b.count - a.count)

    const maxCount = entries[0].count
    const peakHours = entries.filter((e) => e.count === maxCount).map((e) => e.hour)

    peakHours.sort((a, b) => a - b)

    if (peakHours.length === 1) {
      return `${peakHours[0].toString().padStart(2, "0")}:00 UTC`
    }

    let isConsecutive = true
    for (let i = 1; i < peakHours.length; i++) {
      if (peakHours[i] !== peakHours[i - 1] + 1) {
        isConsecutive = false
        break
      }
    }

    if (isConsecutive) {
      const start = peakHours[0].toString().padStart(2, "0")
      const end = peakHours[peakHours.length - 1].toString().padStart(2, "0")
      return `${start}:00–${end}:00 UTC`
    }

    return `Peak Activity: ${peakHours[0].toString().padStart(2, "0")}:00 UTC`
  },

  exportAll: () => {
    return {
      version: "1.0",
      timestamp: new Date().toISOString(),
      type: "all",
      data: get().servers,
    }
  },

  exportServer: (serverId) => {
    const server = get().servers.find((s) => s.id === serverId)
    if (!server) return null
    return {
      version: "1.0",
      timestamp: new Date().toISOString(),
      type: "server",
      data: server,
    }
  },

  exportClan: (serverId, clanId) => {
    const server = get().servers.find((s) => s.id === serverId)
    const clan = server?.clans.find((c) => c.id === clanId)
    if (!clan) return null
    return {
      version: "1.0",
      timestamp: new Date().toISOString(),
      type: "clan",
      data: clan,
    }
  },

  exportMember: (serverId, clanId, memberId) => {
    const server = get().servers.find((s) => s.id === serverId)
    const clan = server?.clans.find((c) => c.id === clanId)
    const member = clan?.members.find((m) => m.id === memberId)
    if (!member) return null
    return {
      version: "1.0",
      timestamp: new Date().toISOString(),
      type: "member",
      data: member,
    }
  },

  importData: async (data, overwrite = false) => {
    try {
      if (data.type === "all") {
        const servers = data.data as Server[]
        // Create each server via API
        for (const server of servers) {
          const response = await fetch("/api/servers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: server.name }),
          })
          if (response.ok) {
            const newServer = await response.json()
            // Create clans for this server
            for (const clan of server.clans) {
              const clanResponse = await fetch(`/api/servers/${newServer.id}/clans`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: clan.name }),
              })
              if (clanResponse.ok) {
                const newClan = await clanResponse.json()
                // Create members for this clan
                for (const member of clan.members) {
                  await fetch(`/api/servers/${newServer.id}/clans/${newClan.id}/members`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(member),
                  })
                }
              }
            }
          }
        }
        await get().fetchServers()
        return { success: true, message: "All data imported successfully" }
      } else if (data.type === "server") {
        const server = data.data as Server
        const response = await fetch("/api/servers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: server.name }),
        })
        if (response.ok) {
          const newServer = await response.json()
          for (const clan of server.clans) {
            const clanResponse = await fetch(`/api/servers/${newServer.id}/clans`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: clan.name }),
            })
            if (clanResponse.ok) {
              const newClan = await clanResponse.json()
              for (const member of clan.members) {
                await fetch(`/api/servers/${newServer.id}/clans/${newClan.id}/members`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(member),
                })
              }
            }
          }
        }
        await get().fetchServers()
        return { success: true, message: "Server imported successfully" }
      } else if (data.type === "clan") {
        const clan = data.data as Clan
        const selectedServer = get().selectedServerId
        if (!selectedServer) {
          return { success: false, message: "Please select a server first" }
        }
        const clanResponse = await fetch(`/api/servers/${selectedServer}/clans`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: clan.name }),
        })
        if (clanResponse.ok) {
          const newClan = await clanResponse.json()
          for (const member of clan.members) {
            await fetch(`/api/servers/${selectedServer}/clans/${newClan.id}/members`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(member),
            })
          }
        }
        await get().fetchServers()
        return { success: true, message: "Clan imported successfully" }
      } else if (data.type === "member") {
        const member = data.data as Member
        const selectedClan = get().selectedClanId
        const selectedServer = get().selectedServerId
        if (!selectedServer || !selectedClan) {
          return { success: false, message: "Please select a server and clan first" }
        }
        await fetch(`/api/servers/${selectedServer}/clans/${selectedClan}/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(member),
        })
        await get().fetchServers()
        return { success: true, message: "Member imported successfully" }
      }
      return { success: false, message: "Unknown data type" }
    } catch (error) {
      return { success: false, message: "Import failed" }
    }
  },

  search: (query) => {
    const results: SearchResult[] = []
    const lowerQuery = query.toLowerCase().trim()

    if (!lowerQuery) return results

    const servers = get().servers

    servers.forEach((server) => {
      server.clans.forEach((clan) => {
        if (clan.name.toLowerCase().includes(lowerQuery) || clan.tag?.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: "clan",
            clan,
            server,
          })
        }

        clan.members.forEach((member) => {
          if (member.name.toLowerCase().includes(lowerQuery)) {
            results.push({
              type: "member",
              member,
              clan,
              server,
            })
          }
        })
      })
    })

    return results
  },

  addGroundhogRun: async (serverId, date, images) => {
    try {
      const response = await fetch(`/api/servers/${serverId}/groundhog-runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, images }),
      })
      if (!response.ok) throw new Error("Failed to create groundhog run")
      const newRun = await response.json()
      set((state) => ({
        servers: state.servers.map((s) =>
          s.id === serverId ? { ...s, groundhogRuns: [...(s.groundhogRuns || []), newRun] } : s,
        ),
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  updateGroundhogRun: async (serverId, runId, updates) => {
    set((state) => ({
      servers: state.servers.map((s) =>
        s.id === serverId
          ? {
              ...s,
              groundhogRuns: (s.groundhogRuns || []).map((run) =>
                run.id === runId ? { ...run, ...updates } : run,
              ),
            }
          : s,
      ),
    }))
  },

  deleteGroundhogRun: async (serverId, runId) => {
    try {
      const response = await fetch(`/api/servers/${serverId}/groundhog-runs/${runId}`, { 
        method: "DELETE" 
      })
      if (!response.ok) throw new Error("Failed to delete groundhog run")
      set((state) => ({
        servers: state.servers.map((s) =>
          s.id === serverId
            ? {
                ...s,
                groundhogRuns: (s.groundhogRuns || []).filter((run) => run.id !== runId),
              }
            : s,
        ),
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },
}))
