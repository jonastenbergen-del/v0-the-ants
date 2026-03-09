"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAntsStore } from "@/lib/store"

interface EditClanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  serverId: string
  clanId: string
}

export function EditClanDialog({ open, onOpenChange, serverId, clanId }: EditClanDialogProps) {
  const { servers, updateClan } = useAntsStore()
  const server = servers.find((s) => s.id === serverId)
  const clan = server?.clans.find((c) => c.id === clanId)

  const [name, setName] = useState("")
  const [tag, setTag] = useState("")
  const [language, setLanguage] = useState<"EN" | "DE" | "Mixed" | "Other">("EN")
  const [activeTimeWindow, setActiveTimeWindow] = useState("")
  const [pvpFocus, setPvpFocus] = useState<"Casual" | "Competitive" | "Hardcore">("Competitive")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (clan) {
      setName(clan.name)
      setTag(clan.tag)
      setLanguage(clan.language)
      setActiveTimeWindow(clan.activeTimeWindow)
      setPvpFocus(clan.pvpFocus)
      setNotes(clan.notes || "")
    }
  }, [clan])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && tag.trim()) {
      updateClan(serverId, clanId, {
        name: name.trim(),
        tag: tag.trim(),
        language,
        activeTimeWindow: activeTimeWindow.trim() || "Unknown",
        pvpFocus,
        notes: notes.trim() || undefined,
      })
      onOpenChange(false)
    }
  }

  if (!clan) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card">
        <DialogHeader>
          <DialogTitle>Edit Clan</DialogTitle>
          <DialogDescription>Update clan information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Clan Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Elite Warriors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag">Clan Tag *</Label>
              <Input
                id="tag"
                placeholder="e.g., ELWT"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="font-mono uppercase"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Primary Language</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as typeof language)}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EN">English</SelectItem>
                  <SelectItem value="DE">German</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeWindow">Active Time Window</Label>
              <Input
                id="timeWindow"
                placeholder="e.g., 18:00-23:00"
                value={activeTimeWindow}
                onChange={(e) => setActiveTimeWindow(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pvpFocus">PvP Focus</Label>
            <Select value={pvpFocus} onValueChange={(v) => setPvpFocus(v as typeof pvpFocus)}>
              <SelectTrigger id="pvpFocus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Casual">Casual</SelectItem>
                <SelectItem value="Competitive">Competitive</SelectItem>
                <SelectItem value="Hardcore">Hardcore</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Diplomacy info, Lost Island notes, internal ratings, etc."
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
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
