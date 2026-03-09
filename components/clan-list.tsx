"use client"

import { Plus, Users, Clock, Languages, Filter, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAntsStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { TroopIcon } from "./troop-icon"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GroundhogButton } from "./groundhog-button"

interface ClanListProps {
  onNewClan: () => void
}

export function ClanList({ onNewClan }: ClanListProps) {
  const { servers, selectedServerId, selectedClanId, selectClan, getClanStats, getClanPeakActivity } = useAntsStore()
  const [filterPvpFocus, setFilterPvpFocus] = useState<string>("all")
  const [filterLanguage, setFilterLanguage] = useState<string>("all")

  const selectedServer = servers.find((s) => s.id === selectedServerId)

  if (!selectedServerId || !selectedServer) {
    return (
      <div className="flex flex-1 flex-col border-r border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <h2 className="font-semibold text-foreground">Clans</h2>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-4 text-center text-sm text-muted-foreground">
          Select a server to view clans
        </div>
      </div>
    )
  }

  const filteredClans = selectedServer.clans.filter((clan) => {
    if (filterPvpFocus !== "all" && clan.pvpFocus !== filterPvpFocus) return false
    if (filterLanguage !== "all" && clan.language !== filterLanguage) return false
    return true
  })

  return (
    <div className="flex flex-1 flex-col border-r border-border bg-card">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-primary" />
          <h2 className="font-semibold text-foreground">Clans</h2>
          <Badge variant="secondary" className="text-xs">
            {filteredClans.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <GroundhogButton serverId={selectedServerId} />
          <Button size="sm" onClick={onNewClan} className="h-8 gap-1.5 bg-primary text-primary-foreground">
            <Plus className="size-4" />
            New
          </Button>
        </div>
      </div>

      <div className="sticky top-[57px] z-10 space-y-2 border-b border-border bg-card p-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Filter className="size-3" />
          <span>Filters</span>
        </div>
        <Select value={filterPvpFocus} onValueChange={setFilterPvpFocus}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="PvP Focus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Focus Types</SelectItem>
            <SelectItem value="Casual">Casual</SelectItem>
            <SelectItem value="Competitive">Competitive</SelectItem>
            <SelectItem value="Hardcore">Hardcore</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterLanguage} onValueChange={setFilterLanguage}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            <SelectItem value="EN">English</SelectItem>
            <SelectItem value="DE">German</SelectItem>
            <SelectItem value="Mixed">Mixed</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-red px-3 py-2">
        <div className="space-y-2">
          {filteredClans.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {selectedServer.clans.length === 0 ? (
                <>
                  No clans yet.
                  <br />
                  Click &quot;New&quot; to add one.
                </>
              ) : (
                <>No clans match the current filters.</>
              )}
            </div>
          ) : (
            filteredClans.map((clan) => {
              const stats = getClanStats(selectedServerId, clan.id)
              const peakActivity = getClanPeakActivity(selectedServerId, clan.id)
              const isSelected = selectedClanId === clan.id

              return (
                <Card
                  key={clan.id}
                  className={cn(
                    "cursor-pointer border-2 p-3 transition-all hover:border-primary/50",
                    isSelected ? "border-primary bg-primary/5" : "border-border bg-card/50",
                  )}
                  onClick={() => selectClan(clan.id)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-foreground">{clan.name}</div>
                        <div className="text-xs text-muted-foreground">[{clan.tag}]</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {clan.pvpFocus}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Languages className="size-3" />
                        <span>{clan.language}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="size-3" />
                        <span>{clan.activeTimeWindow}</span>
                      </div>
                    </div>

                    {peakActivity && (
                      <div className="flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs">
                        <TrendingUp className="size-3 text-primary" />
                        <span className="font-medium text-primary">{peakActivity}</span>
                      </div>
                    )}

                    {stats && (
                      <div className="space-y-1.5 border-t border-border pt-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Members:</span>
                          <span className="font-medium text-foreground">{stats.totalMembers}</span>
                        </div>

                        {stats.totalMembers > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-1">
                                <TroopIcon type="G" className="size-3 text-blue-400" />
                                <span className="text-muted-foreground">Guards</span>
                              </div>
                              <span className="font-medium text-foreground">{stats.guardPercentage.toFixed(0)}%</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-1">
                                <TroopIcon type="S" className="size-3 text-red-400" />
                                <span className="text-muted-foreground">Shooters</span>
                              </div>
                              <span className="font-medium text-foreground">{stats.shooterPercentage.toFixed(0)}%</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-1">
                                <TroopIcon type="C" className="size-3 text-amber-400" />
                                <span className="text-muted-foreground">Carriers</span>
                              </div>
                              <span className="font-medium text-foreground">{stats.carrierPercentage.toFixed(0)}%</span>
                            </div>
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
