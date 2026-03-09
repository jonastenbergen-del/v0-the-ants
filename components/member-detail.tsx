"use client"

import { User, Trash2, Edit2, Upload, Activity, RefreshCw, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAntsStore } from "@/lib/store"
import { useState } from "react"
import { EditMemberDialog } from "./dialogs/edit-member-dialog"
import { TransferMemberDialog } from "./dialogs/transfer-member-dialog"
import { MemberClanHistory } from "./member-clan-history"
import { cn } from "@/lib/utils"
import { TroopIcon, getTroopLabel, getTroopColor } from "./troop-icon"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"

export function MemberDetail() {
  const { servers, selectedServerId, selectedClanId, selectedMemberId, deleteMember } = useAntsStore()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)

  const selectedServer = servers.find((s) => s.id === selectedServerId)
  const selectedClan = selectedServer?.clans.find((c) => c.id === selectedClanId)
  const selectedMember = selectedClan?.members.find((m) => m.id === selectedMemberId)

  if (!selectedMember || !selectedServerId || !selectedClanId) {
    return (
      <div className="flex h-full flex-1 flex-col">
        <Card className="border-border bg-card/50 p-8 text-center">
          <User className="mx-auto mb-3 size-12 text-muted-foreground" />
          <p className="text-muted-foreground">Select a member to view details</p>
        </Card>
      </div>
    )
  }

  const handleDelete = () => {
    if (confirm(`Delete member ${selectedMember.name}?`)) {
      deleteMember(selectedServerId, selectedClanId, selectedMember.id)
    }
  }

  return (
    <div className="flex h-full flex-1 flex-col gap-4">
      <Card className="border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="size-20 shrink-0">
              <AvatarImage src={selectedMember.mainUnitImage || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                {selectedMember.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedMember.name}</h2>
                  <div className="text-sm text-muted-foreground">
                    {selectedMember.pvpRole && selectedMember.pvpRole !== "Unknown"
                      ? `${selectedMember.pvpRole} • Member Profile`
                      : "Member Profile"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge
                  variant={selectedMember.activityStatus === "active" ? "default" : "secondary"}
                  className={cn(
                    selectedMember.activityStatus === "active"
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      : selectedMember.activityStatus === "inactive"
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        : "bg-muted/50 text-muted-foreground",
                  )}
                >
                  {selectedMember.activityStatus === "active" && <Activity className="mr-1 size-3" />}
                  {selectedMember.activityStatus.charAt(0).toUpperCase() + selectedMember.activityStatus.slice(1)}
                </Badge>

                {selectedMember.power && (
                  <Badge variant="outline">
                    Power:{" "}
                    {selectedMember.power >= 1000000
                      ? `${(selectedMember.power / 1000000).toFixed(1)}M`
                      : selectedMember.power >= 1000
                        ? `${(selectedMember.power / 1000).toFixed(0)}K`
                        : selectedMember.power}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setTransferDialogOpen(true)} title="Transfer Member">
              <RefreshCw className="size-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)} title="Edit Member">
              <Edit2 className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              title="Delete Member"
              className="bg-transparent text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border-border bg-card p-6">
        <h3 className="mb-4 font-semibold text-foreground">Troop Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-lg bg-muted/30 p-4">
            <TroopIcon
              type={selectedMember.mainClass}
              className={cn("size-8", getTroopColor(selectedMember.mainClass))}
            />
            <div>
              <div className="text-sm text-muted-foreground">Main Class</div>
              <div className="font-semibold text-foreground">{getTroopLabel(selectedMember.mainClass)}</div>
            </div>
          </div>

          {selectedMember.secondaryClasses && selectedMember.secondaryClasses.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Secondary Classes</div>
              <div className="flex flex-wrap gap-2">
                {selectedMember.secondaryClasses.map((sc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2"
                  >
                    <TroopIcon type={sc.type} className={cn("size-4", getTroopColor(sc.type))} />
                    <span className="text-sm text-foreground">{getTroopLabel(sc.type)}</span>
                    <span className="text-xs text-muted-foreground">({sc.weight}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedMember.mainUnitImage && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Main Unit</div>
              <div className="overflow-hidden rounded-lg border border-border">
                <img
                  src={selectedMember.mainUnitImage || "/placeholder.svg"}
                  alt="Main unit configuration"
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          )}

          {!selectedMember.mainUnitImage && (
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-8">
              <div className="text-center">
                <Upload className="mx-auto mb-2 size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No main unit image uploaded</p>
                <p className="text-xs text-muted-foreground">Edit member to add an image</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {selectedMember.unitImages && selectedMember.unitImages.length > 0 && (
        <Card className="border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <ImageIcon className="size-5 text-primary" />
            <h3 className="font-semibold text-foreground">Unit Images</h3>
            <Badge variant="secondary" className="text-xs">
              {selectedMember.unitImages.length}
            </Badge>
          </div>
          <div className="space-y-4">
            {selectedMember.unitImages.map((unit) => (
              <div key={unit.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <TroopIcon type={unit.troopType} className={cn("size-4", getTroopColor(unit.troopType))} />
                  <span className="text-sm font-medium text-foreground">{getTroopLabel(unit.troopType)}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {unit.mainUnitImage && (
                    <button
                      onClick={() => setZoomedImage(unit.mainUnitImage!)}
                      className="group relative overflow-hidden rounded-lg border border-border transition-all hover:border-primary"
                    >
                      <img
                        src={unit.mainUnitImage || "/placeholder.svg"}
                        alt="Main unit"
                        className="h-24 w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <Badge className="text-xs">Main</Badge>
                      </div>
                    </button>
                  )}
                  {unit.secondaryUnitImages?.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setZoomedImage(img)}
                      className="overflow-hidden rounded-lg border border-border transition-all hover:border-primary"
                    >
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`Secondary unit ${idx + 1}`}
                        className="h-24 w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {selectedMember.notes && (
        <Card className="border-border bg-card p-6">
          <h3 className="mb-3 font-semibold text-foreground">Notes & PvP Role</h3>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{selectedMember.notes}</p>
        </Card>
      )}

      {selectedMember.clanHistory && selectedMember.clanHistory.length > 0 && (
        <MemberClanHistory history={selectedMember.clanHistory} />
      )}

      <Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
        <DialogContent className="max-w-4xl bg-black/95">
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
          >
            <X className="size-5 text-white" />
          </button>
          {zoomedImage && (
            <img src={zoomedImage || "/placeholder.svg"} alt="Zoomed unit" className="h-auto w-full object-contain" />
          )}
        </DialogContent>
      </Dialog>

      {selectedServerId && selectedClanId && selectedMember && (
        <>
          <EditMemberDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            serverId={selectedServerId}
            clanId={selectedClanId}
            memberId={selectedMember.id}
          />
          <TransferMemberDialog
            open={transferDialogOpen}
            onOpenChange={setTransferDialogOpen}
            memberId={selectedMember.id}
            currentServerId={selectedServerId}
            currentClanId={selectedClanId}
          />
        </>
      )}
    </div>
  )
}
