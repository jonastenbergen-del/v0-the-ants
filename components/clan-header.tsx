"use client"

import { Users, Trash2, Edit2, Languages, Clock, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAntsStore } from "@/lib/store"
import { useState } from "react"
import { EditClanDialog } from "./dialogs/edit-clan-dialog"

export function ClanHeader() {
  const { servers, selectedServerId, selectedClanId, deleteClan, getClanStats } = useAntsStore()
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const selectedServer = servers.find((s) => s.id === selectedServerId)
  const selectedClan = selectedServer?.clans.find((c) => c.id === selectedClanId)
  const stats = selectedServerId && selectedClanId ? getClanStats(selectedServerId, selectedClanId) : null

  if (!selectedClan || !selectedServerId) {
    return (
      <Card className="border-border bg-card/50 p-8 text-center">
        <Users className="mx-auto mb-3 size-12 text-muted-foreground" />
        <p className="text-muted-foreground">Select a clan to view details</p>
      </Card>
    )
  }

  const handleDelete = () => {
    if (confirm(`Delete clan ${selectedClan.name}? This will remove all members.`)) {
      deleteClan(selectedServerId, selectedClan.id)
    }
  }

  return (
    <>
      <Card className="border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Users className="size-6 text-primary" />
              <div>
                <h2 className="text-2xl font-bold text-foreground">{selectedClan.name}</h2>
                <div className="font-mono text-sm text-muted-foreground">[{selectedClan.tag}]</div>
              </div>
              <Badge variant="outline" className="text-xs">
                {selectedClan.pvpFocus}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Languages className="size-4 text-muted-foreground" />
                <span className="text-foreground">{selectedClan.language}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <span className="text-foreground">{selectedClan.activeTimeWindow}</span>
              </div>
              {stats && (
                <div className="flex items-center gap-2">
                  <Target className="size-4 text-muted-foreground" />
                  <span className="text-foreground">{stats.totalMembers} members</span>
                </div>
              )}
            </div>

            {stats && stats.totalMembers > 0 && (
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">G:</span>{" "}
                  <span className="font-semibold text-blue-400">{stats.guardPercentage.toFixed(0)}%</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">S:</span>{" "}
                  <span className="font-semibold text-red-400">{stats.shooterPercentage.toFixed(0)}%</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">C:</span>{" "}
                  <span className="font-semibold text-amber-400">{stats.carrierPercentage.toFixed(0)}%</span>
                </div>
                {stats.totalPower > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Power:</span>{" "}
                    <span className="font-semibold text-foreground">{(stats.totalPower / 1000000).toFixed(1)}M</span>
                  </div>
                )}
              </div>
            )}

            {selectedClan.notes && <p className="max-w-2xl text-sm text-muted-foreground">{selectedClan.notes}</p>}
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

      {selectedServerId && selectedClanId && (
        <EditClanDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          serverId={selectedServerId}
          clanId={selectedClanId}
        />
      )}
    </>
  )
}
