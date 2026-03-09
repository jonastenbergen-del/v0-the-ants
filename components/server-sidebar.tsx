"use client"

import { Plus, ServerIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAntsStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface ServerSidebarProps {
  onNewServer: () => void
}

export function ServerSidebar({ onNewServer }: ServerSidebarProps) {
  const { servers, selectedServerId, selectServer, getServerStats } = useAntsStore()

  return (
    <div className="flex flex-1 flex-col border-r border-border bg-card">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <ServerIcon className="size-5 text-primary" />
          <h2 className="font-semibold text-foreground">Servers</h2>
        </div>
        <Button size="sm" onClick={onNewServer} className="h-8 gap-1.5 bg-primary text-primary-foreground">
          <Plus className="size-4" />
          New
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-red px-3 py-2">
        <div className="space-y-2">
          {servers.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No servers yet.
              <br />
              Click &quot;New&quot; to add one.
            </div>
          ) : (
            servers.map((server) => {
              const stats = getServerStats(server.id)
              const isSelected = selectedServerId === server.id

              return (
                <Card
                  key={server.id}
                  className={cn(
                    "cursor-pointer border-2 p-3 transition-all hover:border-primary/50",
                    isSelected ? "border-primary bg-primary/5" : "border-border bg-card/50",
                  )}
                  onClick={() => selectServer(server.id)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="font-mono text-lg font-bold text-foreground">{server.serverNumber}</div>
                      {stats && stats.totalPower > 0 && (
                        <div className="text-xs text-muted-foreground">{(stats.totalPower / 1000000).toFixed(1)}M</div>
                      )}
                    </div>
                    {stats && (
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Clans:</span>
                          <span className="font-medium text-foreground">{stats.totalClans}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Members:</span>
                          <span className="font-medium text-foreground">{stats.totalMembers}</span>
                        </div>
                        {stats.totalMembers > 0 && (
                          <div className="flex gap-1 pt-1">
                            <div
                              className="h-1.5 rounded-full bg-blue-400"
                              style={{
                                width: `${(stats.classDistribution.G / stats.totalMembers) * 100}%`,
                              }}
                            />
                            <div
                              className="h-1.5 rounded-full bg-red-400"
                              style={{
                                width: `${(stats.classDistribution.S / stats.totalMembers) * 100}%`,
                              }}
                            />
                            <div
                              className="h-1.5 rounded-full bg-amber-400"
                              style={{
                                width: `${(stats.classDistribution.C / stats.totalMembers) * 100}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
