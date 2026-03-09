"use client"

import { useState } from "react"
import { ServerSidebar } from "@/components/server-sidebar"
import { ServerHeader } from "@/components/server-header"
import { ClanList } from "@/components/clan-list"
import { ClanHeader } from "@/components/clan-header"
import { MemberList } from "@/components/member-list"
import { MemberDetail } from "@/components/member-detail"
import { StatsOverview } from "@/components/stats-overview"
import { NewServerDialog } from "@/components/dialogs/new-server-dialog"
import { NewClanDialog } from "@/components/dialogs/new-clan-dialog"
import { NewMemberDialog } from "@/components/dialogs/new-member-dialog"
import { ImportExportToolbar } from "@/components/import-export-toolbar"
import { GlobalSearch } from "@/components/global-search"
import { Bug } from "lucide-react"
import { useAntsStore } from "@/lib/store"

export default function HomePage() {
  const [newServerOpen, setNewServerOpen] = useState(false)
  const [newClanOpen, setNewClanOpen] = useState(false)
  const [newMemberOpen, setNewMemberOpen] = useState(false)

  const { selectedServerId, selectedClanId, selectedMemberId } = useAntsStore()

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <Bug className="size-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">The Ants - Management Center</h1>
            <p className="text-xs text-muted-foreground">
              Created by 12345 (Gh<span className="text-xs">Ø</span>st)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <GlobalSearch />
          <ImportExportToolbar />
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Level 1: Server Sidebar */}
        <ServerSidebar onNewServer={() => setNewServerOpen(true)} />

        {/* Level 2: Clan List */}
        <ClanList onNewClan={() => setNewClanOpen(true)} />

        {/* Level 3: Member List */}
        <MemberList onNewMember={() => setNewMemberOpen(true)} />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-y-auto scroll-red p-6">
          <div className="space-y-4">
            {/* Show stats overview when server is selected but no member is selected */}
            {selectedServerId && !selectedMemberId && <StatsOverview />}

            <ServerHeader />
            <ClanHeader />
            <MemberDetail />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <NewServerDialog open={newServerOpen} onOpenChange={setNewServerOpen} />
      <NewClanDialog open={newClanOpen} onOpenChange={setNewClanOpen} />
      <NewMemberDialog open={newMemberOpen} onOpenChange={setNewMemberOpen} />
    </div>
  )
}
