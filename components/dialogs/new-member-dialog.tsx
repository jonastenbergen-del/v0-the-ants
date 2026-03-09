"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAntsStore } from "@/lib/store"
import type { TroopType, MainUnit } from "@/lib/types"
import { getTroopLabel } from "@/components/troop-icon"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, UserPlus, RefreshCw, Upload, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface NewMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewMemberDialog({ open, onOpenChange }: NewMemberDialogProps) {
  const [name, setName] = useState("")
  const [mainClass, setMainClass] = useState<TroopType>("G")
  const [mainUnit, setMainUnit] = useState<MainUnit>("Unknown")
  const [power, setPower] = useState("")
  const [activityStatus, setActivityStatus] = useState<"active" | "inactive" | "unknown">("unknown")
  const [notes, setNotes] = useState("")
  const [profileImage, setProfileImage] = useState<string | undefined>()
  const [activeTime, setActiveTime] = useState("")
  const [duplicateCheck, setDuplicateCheck] = useState<{
    exists: boolean
    serverId: string
    clanId: string
    memberName: string
  } | null>(null)

  const { selectedServerId, selectedClanId, addMember, findMemberByName, transferMember, servers } = useAntsStore()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNameChange = (newName: string) => {
    setName(newName)
    if (newName.trim()) {
      const existing = findMemberByName(newName.trim())
      if (existing) {
        setDuplicateCheck({
          exists: true,
          serverId: existing.serverId,
          clanId: existing.clanId,
          memberName: existing.member.name,
        })
      } else {
        setDuplicateCheck(null)
      }
    } else {
      setDuplicateCheck(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedServerId && selectedClanId && name.trim()) {
      addMember(selectedServerId, selectedClanId, {
        name: name.trim(),
        mainClass,
        power: power ? Number.parseInt(power) : undefined,
        activityStatus,
        notes: notes.trim() || undefined,
        mainUnitImage: profileImage,
        pvpRole: mainUnit !== "Unknown" ? mainUnit : undefined,
        activeTime: activeTime.trim() || undefined,
      })
      resetForm()
      onOpenChange(false)
    }
  }

  const handleTransferMember = () => {
    if (duplicateCheck && selectedServerId && selectedClanId) {
      const existing = findMemberByName(name.trim())
      if (existing) {
        transferMember(existing.member.id, existing.clanId, selectedClanId, selectedServerId, selectedServerId)
        resetForm()
        onOpenChange(false)
      }
    }
  }

  const resetForm = () => {
    setName("")
    setMainClass("G")
    setMainUnit("Unknown")
    setPower("")
    setActivityStatus("unknown")
    setNotes("")
    setProfileImage(undefined)
    setActiveTime("")
    setDuplicateCheck(null)
  }

  const getDuplicateLocation = () => {
    if (!duplicateCheck) return null
    const server = servers.find((s) => s.id === duplicateCheck.serverId)
    const clan = server?.clans.find((c) => c.id === duplicateCheck.clanId)
    return { serverNumber: server?.serverNumber, clanName: clan?.name, clanTag: clan?.tag }
  }

  const duplicateLocation = getDuplicateLocation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>Add a member to track their troop configuration and PvP role.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
              <Avatar className="size-20">
                <AvatarImage src={profileImage || "/placeholder.svg"} />
                <AvatarFallback className="bg-muted text-lg font-bold">
                  {name.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <Input
                  id="profile-pic"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("profile-pic")?.click()}
                >
                  <Upload className="mr-2 size-4" />
                  Upload Image
                </Button>
                {profileImage && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setProfileImage(undefined)}>
                    <X className="mr-2 size-4" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Member Name *</Label>
            <Input
              id="name"
              placeholder="e.g., PlayerName123"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          {duplicateCheck && duplicateLocation && (
            <Alert className="border-orange-500/50 bg-orange-500/10">
              <AlertCircle className="size-4 text-orange-400" />
              <AlertDescription className="text-sm">
                <div className="mb-3 font-medium text-orange-400">Member already exists!</div>
                <div className="mb-3 text-xs text-muted-foreground">
                  <strong>{duplicateCheck.memberName}</strong> is currently in:
                  <br />
                  Server: <strong>{duplicateLocation.serverNumber}</strong> → Clan:{" "}
                  <strong>
                    {duplicateLocation.clanName} [{duplicateLocation.clanTag}]
                  </strong>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2 border-orange-500/50 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                    onClick={handleTransferMember}
                  >
                    <RefreshCw className="size-3" />
                    Transfer to This Clan
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2 bg-transparent"
                    onClick={() => setDuplicateCheck(null)}
                  >
                    <UserPlus className="size-3" />
                    Create New Entry
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mainClass">Main Troop Class *</Label>
              <Select value={mainClass} onValueChange={(v) => setMainClass(v as TroopType)}>
                <SelectTrigger id="mainClass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="G">{getTroopLabel("G")}</SelectItem>
                  <SelectItem value="S">{getTroopLabel("S")}</SelectItem>
                  <SelectItem value="C">{getTroopLabel("C")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mainUnit">Main Unit</Label>
              <Select value={mainUnit} onValueChange={(v) => setMainUnit(v as MainUnit)}>
                <SelectTrigger id="mainUnit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Shooter">Shooter</SelectItem>
                  <SelectItem value="Guard">Guard</SelectItem>
                  <SelectItem value="Carrier">Carrier</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="power">Power</Label>
            <Input
              id="power"
              type="number"
              placeholder="e.g., 50000000"
              value={power}
              onChange={(e) => setPower(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityStatus">Activity Status</Label>
            <Select value={activityStatus} onValueChange={(v) => setActivityStatus(v as typeof activityStatus)}>
              <SelectTrigger id="activityStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activeTime">Active Time (UTC)</Label>
            <Input
              id="activeTime"
              placeholder='e.g., "18:00–22:00 UTC", "Mostly evenings", "10–14 UTC"'
              value={activeTime}
              onChange={(e) => setActiveTime(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Enter when this player is typically active (UTC timezone)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes & PvP Role</Label>
            <Textarea
              id="notes"
              placeholder='Build notes, PvP role, special notes (e.g., "LI player", "Whale", "Farmer")'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground">
              Add Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
