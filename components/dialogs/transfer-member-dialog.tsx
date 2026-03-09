"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAntsStore } from "@/lib/store"
import { ArrowRight, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TransferMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberId: string
  currentServerId: string
  currentClanId: string
}

export function TransferMemberDialog({
  open,
  onOpenChange,
  memberId,
  currentServerId,
  currentClanId,
}: TransferMemberDialogProps) {
  const { toast } = useToast()
  const [targetServerId, setTargetServerId] = useState(currentServerId)
  const [targetClanId, setTargetClanId] = useState("")
  const [note, setNote] = useState("")

  const { servers, transferMember } = useAntsStore()

  const currentServer = servers.find((s) => s.id === currentServerId)
  const currentClan = currentServer?.clans.find((c) => c.id === currentClanId)
  const member = currentClan?.members.find((m) => m.id === memberId)

  const targetServer = servers.find((s) => s.id === targetServerId)
  const availableClans =
    targetServer?.clans.filter((c) => {
      // If same server, exclude current clan
      if (targetServerId === currentServerId) {
        return c.id !== currentClanId
      }
      // If different server, show all clans
      return true
    }) || []

  const handleTransfer = () => {
    if (!targetClanId) {
      toast({ title: "Error", description: "Please select a target clan", variant: "destructive" })
      return
    }

    transferMember(memberId, currentClanId, targetClanId, currentServerId, targetServerId, note)

    const isCrossServer = targetServerId !== currentServerId
    toast({
      title: "Success",
      description: `${member?.name} transferred successfully${isCrossServer ? " to another server" : ""}`,
    })
    onOpenChange(false)
    setTargetServerId(currentServerId)
    setTargetClanId("")
    setNote("")
  }

  const handleServerChange = (newServerId: string) => {
    setTargetServerId(newServerId)
    setTargetClanId("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Transfer Member</DialogTitle>
          <DialogDescription>
            Move {member?.name} to another clan{targetServerId !== currentServerId ? " or server" : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="mb-2 text-xs font-medium text-muted-foreground">Current Location</div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Server {currentServer?.serverNumber}</div>
              <div className="font-semibold text-foreground">
                {currentClan?.name} [{currentClan?.tag}]
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="size-6 text-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetServer">Target Server *</Label>
            <Select value={targetServerId} onValueChange={handleServerChange}>
              <SelectTrigger id="targetServer">
                <SelectValue placeholder="Select destination server" />
              </SelectTrigger>
              <SelectContent>
                {servers.map((server) => (
                  <SelectItem key={server.id} value={server.id}>
                    Server {server.serverNumber}
                    {server.id === currentServerId && " (Current)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetClan">Target Clan *</Label>
            <Select value={targetClanId} onValueChange={setTargetClanId}>
              <SelectTrigger id="targetClan">
                <SelectValue placeholder="Select destination clan" />
              </SelectTrigger>
              <SelectContent>
                {availableClans.length === 0 ? (
                  <div className="p-2 text-center text-sm text-muted-foreground">No clans available</div>
                ) : (
                  availableClans.map((clan) => (
                    <SelectItem key={clan.id} value={clan.id}>
                      {clan.name} [{clan.tag}]
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Transfer Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Why was this member transferred? (e.g., 'Moved for PvP balance')"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
            <p className="text-xs text-orange-400">
              This will move the member and add an entry to their clan history with server and clan information.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={!targetClanId || availableClans.length === 0}
              className="gap-2 bg-primary text-primary-foreground"
            >
              <RefreshCw className="size-4" />
              Transfer Member
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
