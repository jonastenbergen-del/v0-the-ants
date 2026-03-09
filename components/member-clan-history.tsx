"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, Server } from "lucide-react"
import type { ClanHistoryEntry } from "@/lib/types"

interface MemberClanHistoryProps {
  history: ClanHistoryEntry[]
}

export function MemberClanHistory({ history }: MemberClanHistoryProps) {
  if (!history || history.length === 0) {
    return null
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Present"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "Unknown"
    }
  }

  return (
    <Card className="border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <History className="size-5 text-primary" />
        <h3 className="font-semibold text-foreground">Clan History</h3>
        <Badge variant="secondary" className="text-xs">
          {history.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {history.map((entry, index) => (
          <div key={index} className="relative rounded-lg border border-border bg-muted/30 p-4">
            {index < history.length - 1 && <div className="absolute -bottom-3 left-6 h-3 w-0.5 bg-border" />}
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/20 p-2">
                <Server className="size-4 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="font-medium text-foreground">
                  {entry.clanName} [{entry.clanTag}]
                </div>
                <div className="text-xs text-muted-foreground">
                  Server: {entry.serverNumber}
                  {entry.serverName && ` - ${entry.serverName}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {entry.startDate && `${formatDate(entry.startDate)} → `}
                  {formatDate(entry.endDate)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
