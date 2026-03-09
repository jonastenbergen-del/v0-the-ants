"use client"

import { ServerIcon, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAntsStore } from "@/lib/store"
import { useState } from "react"
import { EditServerDialog } from "./dialogs/edit-server-dialog"

export function ServerHeader() {
  const { servers, selectedServerId, deleteServer, getServerStats } = useAntsStore()
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const selectedServer = servers.find((s) => s.id === selectedServerId)
  const stats = selectedServerId ? getServerStats(selectedServerId) : null

  if (!selectedServer) {
    return (
      <Card className="border-border bg-card/50 p-8 text-center">
        <ServerIcon className="mx-auto mb-3 size-12 text-muted-foreground" />
        <p className="text-muted-foreground">Select a server to view details</p>
      </Card>
    )
  }

  const handleDelete = () => {
    if (confirm(`Delete server ${selectedServer.serverNumber}? This will remove all clans and members.`)) {
      deleteServer(selectedServer.id)
    }
  }

  return (
    <>
      <Card className="border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <ServerIcon className="size-6 text-primary" />
              <h1 className="font-mono text-3xl font-bold text-foreground">{selectedServer.serverNumber}</h1>
            </div>

            {stats && (
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Clans:</span>{" "}
                  <span className="font-semibold text-foreground">{stats.totalClans}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Members:</span>{" "}
                  <span className="font-semibold text-foreground">{stats.totalMembers}</span>
                </div>
                {stats.totalPower > 0 && (
                  <div>
                    <span className="text-muted-foreground">Power:</span>{" "}
                    <span className="font-semibold text-foreground">{(stats.totalPower / 1000000).toFixed(1)}M</span>
                  </div>
                )}
              </div>
            )}

            {stats && stats.totalMembers > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-blue-400" />
                  <span className="text-xs text-muted-foreground">
                    G: {((stats.classDistribution.G / stats.totalMembers) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-red-400" />
                  <span className="text-xs text-muted-foreground">
                    S: {((stats.classDistribution.S / stats.totalMembers) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-amber-400" />
                  <span className="text-xs text-muted-foreground">
                    C: {((stats.classDistribution.C / stats.totalMembers) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            )}

            {selectedServer.notes && <p className="max-w-2xl text-sm text-muted-foreground">{selectedServer.notes}</p>}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
              <Edit2 className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-destructive hover:bg-destructive/10 bg-transparent"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </Card>

      <EditServerDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} serverId={selectedServer.id} />
    </>
  )
}
