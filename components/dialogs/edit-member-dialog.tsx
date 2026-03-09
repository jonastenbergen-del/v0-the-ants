"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Upload, X } from "lucide-react"

import { useAntsStore } from "@/lib/store"
import type { TroopType, UnitImage, MainUnit } from "@/lib/types"
import { getTroopLabel } from "@/components/troop-icon"
import { UnitImageManager } from "@/components/unit-image-manager"

interface EditMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  serverId: string
  clanId: string
  memberId: string
}

export function EditMemberDialog({ open, onOpenChange, serverId, clanId, memberId }: EditMemberDialogProps) {
  const { servers, updateMember } = useAntsStore()

  const server = servers.find((s) => s.id === serverId)
  const clan = server?.clans.find((c) => c.id === clanId)
  const member = clan?.members.find((m) => m.id === memberId)

  const [name, setName] = useState("")
  const [mainClass, setMainClass] = useState<TroopType>("G")
  const [mainUnit, setMainUnit] = useState<MainUnit>("Unknown")
  const [power, setPower] = useState("")
  const [activityStatus, setActivityStatus] = useState<"active" | "inactive" | "unknown">("unknown")
  const [notes, setNotes] = useState("")
  const [unitImages, setUnitImages] = useState<UnitImage[]>([])
  const [profileImage, setProfileImage] = useState<string | undefined>()
  const [activeTime, setActiveTime] = useState("")

  useEffect(() => {
    if (!member) return

    setName(member.name)
    setMainClass(member.mainClass)
    setMainUnit((member.pvpRole as MainUnit) || "Unknown")
    setPower(member.power?.toString() || "")
    setActivityStatus(member.activityStatus)
    setNotes(member.notes || "")
    setUnitImages(member.unitImages || [])
    setProfileImage(member.mainUnitImage)
    setActiveTime(member.activeTime || "")
  }, [member])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!name.trim()) return

    updateMember(serverId, clanId, memberId, {
      name: name.trim(),
      mainClass,
      power: power ? Number.parseInt(power) : undefined,
      activityStatus,
      notes: notes.trim() || undefined,
      unitImages,
      mainUnitImage: profileImage,
      pvpRole: mainUnit !== "Unknown" ? mainUnit : undefined,
      activeTime: activeTime.trim() || undefined,
    })

    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSave()
  }

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>Update member information and configuration.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="units">Unit Images</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Image */}
              <div className="space-y-2">
                <Label>Profile Picture</Label>

                <div className="flex items-center gap-4">
                  <Avatar className="size-20">
                    <AvatarImage src={profileImage || "/placeholder.svg"} />
                    <AvatarFallback className="bg-muted text-lg font-bold">
                      {name.charAt(0)?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col gap-2">
                    <Input
                      id="profile-pic-edit"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("profile-pic-edit")?.click()}
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

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Member Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., PlayerName123"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Main Class */}
                <div className="space-y-2">
                  <Label>Main Troop Class</Label>
                  <Select value={mainClass} onValueChange={(v) => setMainClass(v as TroopType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="G">{getTroopLabel("G")}</SelectItem>
                      <SelectItem value="S">{getTroopLabel("S")}</SelectItem>
                      <SelectItem value="C">{getTroopLabel("C")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Main Unit */}
                <div className="space-y-2">
                  <Label>Main Unit</Label>
                  <Select value={mainUnit} onValueChange={(v) => setMainUnit(v as MainUnit)}>
                    <SelectTrigger>
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

                {/* Power */}
                <div className="space-y-2">
                  <Label>Power</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 50000000"
                    value={power}
                    onChange={(e) => setPower(e.target.value)}
                    className="font-mono"
                  />
                </div>

                {/* Activity Status */}
                <div className="space-y-2">
                  <Label>Activity Status</Label>
                  <Select
                    value={activityStatus}
                    onValueChange={(v) => setActivityStatus(v as "active" | "inactive" | "unknown")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Time */}
                <div className="space-y-2">
                  <Label htmlFor="activeTime">Active Time (UTC)</Label>
                  <Input
                    id="activeTime"
                    placeholder='e.g., "18:00–22:00 UTC", "Mostly evenings", "10–14 UTC"'
                    value={activeTime}
                    onChange={(e) => setActiveTime(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter when this player is typically active (UTC timezone)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Notes & PvP Role</Label>
                  <Textarea
                    placeholder="Build notes, PvP role, special notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="units" className="space-y-4">
            <UnitImageManager unitImages={unitImages} onChange={setUnitImages} />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
