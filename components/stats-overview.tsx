"use client"

import { Card } from "@/components/ui/card"
import { useAntsStore } from "@/lib/store"
import { TroopIcon, getTroopLabel } from "./troop-icon"
import { Users, Shield, AlertTriangle, CheckCircle2 } from "lucide-react"

export function StatsOverview() {
  const { servers, selectedServerId, getServerStats } = useAntsStore()

  const selectedServer = servers.find((s) => s.id === selectedServerId)
  const stats = selectedServerId ? getServerStats(selectedServerId) : null

  if (!selectedServer || !stats || stats.totalMembers === 0) {
    return null
  }

  const guardPercent = (stats.classDistribution.G / stats.totalMembers) * 100
  const shooterPercent = (stats.classDistribution.S / stats.totalMembers) * 100
  const carrierPercent = (stats.classDistribution.C / stats.totalMembers) * 100

  // PvP Readiness Score (balanced distribution is better)
  const idealDistribution = 33.33
  const deviation =
    Math.abs(guardPercent - idealDistribution) +
    Math.abs(shooterPercent - idealDistribution) +
    Math.abs(carrierPercent - idealDistribution)
  const balanceScore = Math.max(0, 100 - deviation)

  const getPvpReadiness = () => {
    if (balanceScore >= 80)
      return { label: "Excellent", color: "text-green-400", icon: CheckCircle2, bgColor: "bg-green-500/10" }
    if (balanceScore >= 60)
      return { label: "Good", color: "text-blue-400", icon: CheckCircle2, bgColor: "bg-blue-500/10" }
    if (balanceScore >= 40)
      return { label: "Fair", color: "text-amber-400", icon: AlertTriangle, bgColor: "bg-amber-500/10" }
    return { label: "Unbalanced", color: "text-red-400", icon: AlertTriangle, bgColor: "bg-red-500/10" }
  }

  const pvpReadiness = getPvpReadiness()
  const ReadinessIcon = pvpReadiness.icon

  const classData = [
    { type: "G" as const, count: stats.classDistribution.G, percent: guardPercent, color: "text-blue-400" },
    { type: "S" as const, count: stats.classDistribution.S, percent: shooterPercent, color: "text-red-400" },
    { type: "C" as const, count: stats.classDistribution.C, percent: carrierPercent, color: "text-amber-400" },
  ]

  const sortedClasses = [...classData].sort((a, b) => b.count - a.count)
  const dominantClass = sortedClasses[0]
  const weakClass = sortedClasses[2]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <Users className="size-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.totalMembers}</div>
              <div className="text-sm text-muted-foreground">Total Members</div>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <Shield className="size-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.totalClans}</div>
              <div className="text-sm text-muted-foreground">Active Clans</div>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-3 ${pvpReadiness.bgColor}`}>
              <ReadinessIcon className={`size-6 ${pvpReadiness.color}`} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${pvpReadiness.color}`}>{pvpReadiness.label}</div>
              <div className="text-sm text-muted-foreground">PvP Balance</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="border-border bg-card p-6">
          <h3 className="mb-4 font-semibold text-foreground">Class Distribution</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TroopIcon type="G" className="size-4 text-blue-400" />
                  <span className="text-sm text-foreground">{getTroopLabel("G")}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {stats.classDistribution.G} ({guardPercent.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-blue-400" style={{ width: `${guardPercent}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TroopIcon type="S" className="size-4 text-red-400" />
                  <span className="text-sm text-foreground">{getTroopLabel("S")}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {stats.classDistribution.S} ({shooterPercent.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-red-400" style={{ width: `${shooterPercent}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TroopIcon type="C" className="size-4 text-amber-400" />
                  <span className="text-sm text-foreground">{getTroopLabel("C")}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {stats.classDistribution.C} ({carrierPercent.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${carrierPercent}%` }} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <h3 className="mb-4 font-semibold text-foreground">Strategic Insights</h3>
          <div className="space-y-3">
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
                <TroopIcon type={dominantClass.type} className={`size-4 ${dominantClass.color}`} />
                Dominant Class
              </div>
              <p className="text-xs text-muted-foreground">
                {getTroopLabel(dominantClass.type)} ({dominantClass.percent.toFixed(1)}%) - Strong offensive/defensive
                capability
              </p>
            </div>

            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
                <TroopIcon type={weakClass.type} className={`size-4 ${weakClass.color}`} />
                Needs Reinforcement
              </div>
              <p className="text-xs text-muted-foreground">
                {getTroopLabel(weakClass.type)} ({weakClass.percent.toFixed(1)}%) - Consider recruiting more players
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-3">
              <div className="mb-1 text-sm font-medium text-foreground">PvP Readiness</div>
              <p className="text-xs text-muted-foreground">
                {balanceScore >= 80 ? (
                  <>Well-balanced for competitive play. Ready for Lost Island and major PvP events.</>
                ) : balanceScore >= 60 ? (
                  <>Good balance overall. Minor adjustments could improve versatility.</>
                ) : balanceScore >= 40 ? (
                  <>Moderate imbalance. Consider diversifying troop composition for better tactics.</>
                ) : (
                  <>
                    Heavy imbalance detected. Recruit diverse classes to improve strategic flexibility and counter enemy
                    compositions.
                  </>
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
