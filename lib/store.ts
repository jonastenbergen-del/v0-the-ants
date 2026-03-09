"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Server, Clan, Member, ClanStats, SearchResult, GroundhogRun } from "./types"
import type { ExportData } from "./import-export"

interface AntsStore {
  servers: Server[]
  selectedServerId: string | null
  selectedClanId: string | null
  selectedMemberId: string | null

  // Server actions
  addServer: (server: Omit<Server, "id" | "clans" | "groundhogRuns">) => void
  updateServer: (id: string, updates: Partial<Server>) => void
  deleteServer: (id: string) => void
  selectServer: (id: string | null) => void

  // Clan actions
  addClan: (serverId: string, clan: Omit<Clan, "id" | "members">) => void
  updateClan: (serverId: string, clanId: string, updates: Partial<Clan>) => void
  deleteClan: (serverId: string, clanId: string) => void
  selectClan: (id: string | null) => void

  // Member actions
  addMember: (serverId: string, clanId: string, member: Omit<Member, "id">) => void
  updateMember: (serverId: string, clanId: string, memberId: string, updates: Partial<Member>) => void
  deleteMember: (serverId: string, clanId: string, memberId: string) => void
  selectMember: (id: string | null) => void
  transferMember: (
    memberId: string,
    fromClanId: string,
    toClanId: string,
    fromServerId: string,
    toServerId: string,
    note?: string,
  ) => void
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
  importData: (data: ExportData, overwrite?: boolean) => { success: boolean; message: string }

  search: (query: string) => SearchResult[]
  addGroundhogRun: (serverId: string, date: string, images: string[]) => void
  updateGroundhogRun: (serverId: string, runId: string, updates: Partial<GroundhogRun>) => void
  deleteGroundhogRun: (serverId: string, runId: string) => void
}

function parseTimeRange(activeTime: string): number[] {
  const hours: number[] = []
  // Match patterns like "18:00-22:00", "18-22", "18:00–22:00 UTC"
  const rangeMatch = activeTime.match(/(\d{1,2})(?::00)?[\s\-–—]+(\d{1,2})(?::00)?/)
  if (rangeMatch) {
    const start = Number.parseInt(rangeMatch[1])
    const end = Number.parseInt(rangeMatch[2])
    if (start >= 0 && start <= 23 && end >= 0 && end <= 23) {
      if (start <= end) {
        for (let h = start; h <= end; h++) hours.push(h)
      } else {
        // Handle wrap-around (e.g., 22-02)
        for (let h = start; h <= 23; h++) hours.push(h)
        for (let h = 0; h <= end; h++) hours.push(h)
      }
    }
  }
  // Match single hours like "18" or "18:00"
  const singleMatch = activeTime.match(/\b(\d{1,2})(?::00)?\b/)
  if (singleMatch && hours.length === 0) {
    const hour = Number.parseInt(singleMatch[1])
    if (hour >= 0 && hour <= 23) hours.push(hour)
  }
  return hours
}

export const useAntsStore = create<AntsStore>()(
  persist(
    (set, get) => ({
      servers: [],
      selectedServerId: null,
      selectedClanId: null,
      selectedMemberId: null,

      addServer: (server) => {
        const newServer: Server = {
          ...server,
          id: crypto.randomUUID(),
          clans: [],
          groundhogRuns: [],
        }
        set((state) => ({ servers: [...state.servers, newServer] }))
      },

      updateServer: (id, updates) => {
        set((state) => ({
          servers: state.servers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }))
      },

      deleteServer: (id) => {
        set((state) => ({
          servers: state.servers.filter((s) => s.id !== id),
          selectedServerId: state.selectedServerId === id ? null : state.selectedServerId,
        }))
      },

      selectServer: (id) => set({ selectedServerId: id, selectedClanId: null, selectedMemberId: null }),

      addClan: (serverId, clan) => {
        const newClan: Clan = {
          ...clan,
          id: crypto.randomUUID(),
          members: [],
        }
        set((state) => ({
          servers: state.servers.map((s) => (s.id === serverId ? { ...s, clans: [...s.clans, newClan] } : s)),
        }))
      },

      updateClan: (serverId, clanId, updates) => {
        set((state) => ({
          servers: state.servers.map((s) =>
            s.id === serverId ? { ...s, clans: s.clans.map((c) => (c.id === clanId ? { ...c, ...updates } : c)) } : s,
          ),
        }))
      },

      deleteClan: (serverId, clanId) => {
        set((state) => ({
          servers: state.servers.map((s) =>
            s.id === serverId ? { ...s, clans: s.clans.filter((c) => c.id !== clanId) } : s,
          ),
          selectedClanId: state.selectedClanId === clanId ? null : state.selectedClanId,
        }))
      },

      selectClan: (id) => set({ selectedClanId: id, selectedMemberId: null }),

      addMember: (serverId, clanId, member) => {
        const newMember: Member = {
          ...member,
          id: crypto.randomUUID(),
        }
        set((state) => ({
          servers: state.servers.map((s) =>
            s.id === serverId
              ? {
                  ...s,
                  clans: s.clans.map((c) => (c.id === clanId ? { ...c, members: [...c.members, newMember] } : c)),
                }
              : s,
          ),
        }))
      },

      updateMember: (serverId, clanId, memberId, updates) => {
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
      },

      deleteMember: (serverId, clanId, memberId) => {
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
      },

      selectMember: (id) => set({ selectedMemberId: id }),

      transferMember: (memberId, fromClanId, toClanId, fromServerId, toServerId, note) => {
        const state = get()
        const fromServer = state.servers.find((s) => s.id === fromServerId)
        const toServer = state.servers.find((s) => s.id === toServerId)
        const fromClan = fromServer?.clans.find((c) => c.id === fromClanId)
        const toClan = toServer?.clans.find((c) => c.id === toClanId)
        const member = fromClan?.members.find((m) => m.id === memberId)

        if (!member || !fromClan || !toClan || !fromServer || !toServer) return

        // Add clan history entry with both server and clan information
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

        // Remove from source
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
                clans: s.clans.map((c) => (c.id === toClanId ? { ...c, members: [...c.members, updatedMember] } : c)),
              }
            }
            return s
          }),
        }))
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

        // Count how many members are active during each hour
        clan.members.forEach((member) => {
          if (member.activeTime) {
            const hours = parseTimeRange(member.activeTime)
            hours.forEach((hour) => {
              hourCounts[hour] = (hourCounts[hour] || 0) + 1
            })
          }
        })

        // Find hours with most activity
        const entries = Object.entries(hourCounts).map(([hour, count]) => ({
          hour: Number.parseInt(hour),
          count,
        }))

        if (entries.length === 0) return null

        entries.sort((a, b) => b.count - a.count)

        // Get the max count
        const maxCount = entries[0].count

        // Get all hours with max count
        const peakHours = entries.filter((e) => e.count === maxCount).map((e) => e.hour)

        // Find consecutive ranges
        peakHours.sort((a, b) => a - b)

        if (peakHours.length === 1) {
          return `${peakHours[0].toString().padStart(2, "0")}:00 UTC`
        }

        // Check if hours are consecutive
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

        // Return the most common hour range
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

      importData: (data, overwrite = false) => {
        try {
          if (data.type === "all") {
            const servers = data.data as Server[]
            if (overwrite) {
              set({ servers })
              return { success: true, message: "All data imported successfully" }
            } else {
              set((state) => ({ servers: [...state.servers, ...servers] }))
              return { success: true, message: "Data merged successfully" }
            }
          } else if (data.type === "server") {
            const server = data.data as Server
            set((state) => ({ servers: [...state.servers, server] }))
            return { success: true, message: "Server imported successfully" }
          } else if (data.type === "clan") {
            const clan = data.data as Clan
            const selectedServer = get().selectedServerId
            if (!selectedServer) {
              return { success: false, message: "Please select a server first" }
            }
            set((state) => ({
              servers: state.servers.map((s) => (s.id === selectedServer ? { ...s, clans: [...s.clans, clan] } : s)),
            }))
            return { success: true, message: "Clan imported successfully" }
          } else if (data.type === "member") {
            const member = data.data as Member
            const selectedClan = get().selectedClanId
            const selectedServer = get().selectedServerId
            if (!selectedServer || !selectedClan) {
              return { success: false, message: "Please select a server and clan first" }
            }
            set((state) => ({
              servers: state.servers.map((s) =>
                s.id === selectedServer
                  ? {
                      ...s,
                      clans: s.clans.map((c) =>
                        c.id === selectedClan ? { ...c, members: [...c.members, member] } : c,
                      ),
                    }
                  : s,
              ),
            }))
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
            // Search clans
            if (clan.name.toLowerCase().includes(lowerQuery) || clan.tag.toLowerCase().includes(lowerQuery)) {
              results.push({
                type: "clan",
                clan,
                server,
              })
            }

            // Search members
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

      addGroundhogRun: (serverId, date, images) => {
        const newRun: GroundhogRun = {
          id: crypto.randomUUID(),
          date,
          images,
        }
        set((state) => ({
          servers: state.servers.map((s) =>
            s.id === serverId ? { ...s, groundhogRuns: [...(s.groundhogRuns || []), newRun] } : s,
          ),
        }))
      },

      updateGroundhogRun: (serverId, runId, updates) => {
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

      deleteGroundhogRun: (serverId, runId) => {
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
      },
    }),
    {
      name: "ants-control-center-storage",
    },
  ),
)
