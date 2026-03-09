"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAntsStore } from "@/lib/store"

interface EditServerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  serverId: string
}

export function EditServerDialog({ open, onOpenChange, serverId }: EditServerDialogProps) {
  const { servers, updateServer } = useAntsStore()
  const server = servers.find((s) => s.id === serverId)

  const [serverNumber, setServerNumber] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (server) {
      setServerNumber(server.serverNumber)
      setNotes(server.notes || "")
    }
  }, [server])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (serverNumber.trim()) {
      updateServer(serverId, {
        serverNumber: serverNumber.trim(),
        notes: notes.trim() || undefined,
      })
      onOpenChange(false)
    }
  }

  if (!server) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle>Edit Server</DialogTitle>
          <DialogDescription>Update server information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serverNumber">Server Number *</Label>
            <Input
              id="serverNumber"
              placeholder="e.g., s1398"
              value={serverNumber}
              onChange={(e) => setServerNumber(e.target.value)}
              className="font-mono"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Meta info, season, status, etc."
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
