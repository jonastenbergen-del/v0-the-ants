"use client"

import { Plus, User, Activity, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAntsStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { TroopIcon, getTroopColor } from "./troop-icon"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MemberListProps {
  onNewMember: () => void
}

export function MemberList({ onNewMember }: MemberListProps) {
  const { servers, selectedServerId, selectedClanId, selectedMemberId, selectMember } = useAntsStore()
  const [filterClass, setFilterClass] = useState<string>("all")
  const [filterActivity, setFilterActivity] = useState<string>("all")

  const selectedServer = servers.find((s) => s.id === selectedServerId)
  const selectedClan = selectedServer?.clans.find((c) => c.id === selectedClanId)

  if (!selectedServerId || !selectedClanId || !selectedClan) {
    return (
      <div className="flex flex-1 flex-col border-r border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <User className="size-5 text-primary" />
            <h2 className="font-semibold text-foreground">Members</h2>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-4 text-center text-sm text-muted-foreground">
          Select a clan to view members
        </div>
      </div>
    )
  }

  const filteredMembers = selectedClan.members.filter((member) => {
    if (filterClass !== "all" && member.mainClass !== filterClass) return false
    if (filterActivity !== "all" && member.activityStatus !== filterActivity) return false
    return true
  })

  return (
    <div className="flex flex-1 flex-col border-r border-border bg-card">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <User className="size-5 text-primary" />
          <h2 className="font-semibold text-foreground">Members</h2>
          <Badge variant="secondary" className="text-xs">
            {filteredMembers.length}
          </Badge>
        </div>
        <Button size="sm" onClick={onNewMember} className="h-8 gap-1.5 bg-primary text-primary-foreground">
          <Plus className="size-4" />
          New
        </Button>
      </div>

      <div className="sticky top-[57px] z-10 space-y-2 border-b border-border bg-card p-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Filter className="size-3" />
          <span>Filters</span>
        </div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Troop Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            <SelectItem value="G">Guards Only</SelectItem>
            <SelectItem value="S">Shooters Only</SelectItem>
            <SelectItem value="C">Carriers Only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterActivity} onValueChange={setFilterActivity}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activity</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-red px-3 py-2">
        <div className="space-y-2">
          {filteredMembers.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {selectedClan.members.length === 0 ? (
                <>
                  No members yet.
                  <br />
                  Click &quot;New&quot; to add one.
                </>
              ) : (
                <>No members match the current filters.</>
              )}
            </div>
          ) : (
            filteredMembers.map((member) => {
              const isSelected = selectedMemberId === member.id

              return (
                <Card
                  key={member.id}
                  className={cn(
                    "cursor-pointer border-2 p-3 transition-all hover:border-primary/50",
                    isSelected ? "border-primary bg-primary/5" : "border-border bg-card/50",
                  )}
                  onClick={() => selectMember(member.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="size-12 shrink-0">
                      <AvatarImage src={member.mainUnitImage || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">{member.name}</div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <TroopIcon
                              type={member.mainClass}
                              className={cn("size-3", getTroopColor(member.mainClass))}
                            />
                            <span className="text-muted-foreground">
                              {member.pvpRole && member.pvpRole !== "Unknown" ? member.pvpRole : "Main"}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={member.activityStatus === "active" ? "default" : "secondary"}
                          className={cn(
                            "text-xs",
                            member.activityStatus === "active"
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : member.activityStatus === "inactive"
                                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                : "bg-muted/50 text-muted-foreground",
                          )}
                        >
                          {member.activityStatus === "active" && <Activity className="mr-1 size-2.5" />}
                          {member.activityStatus}
                        </Badge>
                      </div>

                      {member.power && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Power:</span>
                          <span className="font-mono font-medium text-foreground">
                            {member.power >= 1000000
                              ? `${(member.power / 1000000).toFixed(1)}M`
                              : member.power >= 1000
                                ? `${(member.power / 1000).toFixed(0)}K`
                                : member.power}
                          </span>
                        </div>
                      )}

                      {member.secondaryClasses && member.secondaryClasses.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                          <span>Also:</span>
                          {member.secondaryClasses.map((sc, idx) => (
                            <TroopIcon key={idx} type={sc.type} className={cn("size-3", getTroopColor(sc.type))} />
                          ))}
                        </div>
                      )}
                    </div>
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
