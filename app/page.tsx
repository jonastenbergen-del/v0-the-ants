"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Bug, Loader2, LogOut } from "lucide-react"
import { useAntsStore } from "@/lib/store"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [newServerOpen, setNewServerOpen] = useState(false)
  const [newClanOpen, setNewClanOpen] = useState(false)
  const [newMemberOpen, setNewMemberOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()

  const { selectedServerId, selectedClanId, selectedMemberId, fetchServers, isLoading } = useAntsStore()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setAuthLoading(false)
      
      if (user) {
        fetchServers()
      }
    }
    checkAuth()
  }, [fetchServers])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    router.push("/auth/login")
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

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
          <div className="flex items-center gap-2 border-l border-border pl-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" />
            </Button>
          </div>
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
