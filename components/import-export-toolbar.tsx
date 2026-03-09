"use client"

import type React from "react"

import { Download, Upload, FileJson } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAntsStore } from "@/lib/store"
import { downloadJSON, parseImportFile } from "@/lib/import-export"
import { useToast } from "@/hooks/use-toast"
import { useRef } from "react"

export function ImportExportToolbar() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    exportAll,
    exportServer,
    exportClan,
    exportMember,
    importData,
    selectedServerId,
    selectedClanId,
    selectedMemberId,
    servers,
  } = useAntsStore()

  const selectedServer = servers.find((s) => s.id === selectedServerId)
  const selectedClan = selectedServer?.clans.find((c) => c.id === selectedClanId)

  const handleExportAll = () => {
    const data = exportAll()
    downloadJSON(data, `ants-all-data-${new Date().toISOString().split("T")[0]}`)
    toast({ title: "Success", description: "All data exported successfully" })
  }

  const handleExportServer = () => {
    if (!selectedServerId) {
      toast({ title: "Error", description: "Please select a server first", variant: "destructive" })
      return
    }
    const data = exportServer(selectedServerId)
    if (data) {
      downloadJSON(data, `ants-server-${selectedServer?.serverNumber}-${new Date().toISOString().split("T")[0]}`)
      toast({ title: "Success", description: "Server exported successfully" })
    }
  }

  const handleExportClan = () => {
    if (!selectedServerId || !selectedClanId) {
      toast({ title: "Error", description: "Please select a server and clan first", variant: "destructive" })
      return
    }
    const data = exportClan(selectedServerId, selectedClanId)
    if (data) {
      downloadJSON(data, `ants-clan-${selectedClan?.tag}-${new Date().toISOString().split("T")[0]}`)
      toast({ title: "Success", description: "Clan exported successfully" })
    }
  }

  const handleExportMember = () => {
    if (!selectedServerId || !selectedClanId || !selectedMemberId) {
      toast({ title: "Error", description: "Please select a server, clan and member first", variant: "destructive" })
      return
    }
    const data = exportMember(selectedServerId, selectedClanId, selectedMemberId)
    if (data) {
      const member = selectedClan?.members.find((m) => m.id === selectedMemberId)
      downloadJSON(data, `ants-member-${member?.name}-${new Date().toISOString().split("T")[0]}`)
      toast({ title: "Success", description: "Member exported successfully" })
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const data = await parseImportFile(file)
      const result = importData(data, false)
      if (result.success) {
        toast({ title: "Success", description: result.message })
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to import file", variant: "destructive" })
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleExportAll}>
            <FileJson className="mr-2 h-4 w-4" />
            Export All Data
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExportServer} disabled={!selectedServerId}>
            <FileJson className="mr-2 h-4 w-4" />
            Export Server
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportClan} disabled={!selectedClanId}>
            <FileJson className="mr-2 h-4 w-4" />
            Export Clan
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportMember} disabled={!selectedMemberId}>
            <FileJson className="mr-2 h-4 w-4" />
            Export Member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input ref={fileInputRef} type="file" accept=".antsdata,.json" className="hidden" onChange={handleImport} />
      <Button
        variant="outline"
        size="sm"
        className="gap-2 bg-transparent"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        Import
      </Button>
    </div>
  )
}
