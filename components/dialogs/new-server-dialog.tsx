"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAntsStore } from "@/lib/store"

interface NewServerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewServerDialog({ open, onOpenChange }: NewServerDialogProps) {
  const [serverNumber, setServerNumber] = useState("")
  const [notes, setNotes] = useState("")
  const addServer = useAntsStore((state) => state.addServer)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (serverNumber.trim()) {
      addServer({
        serverNumber: serverNumber.trim(),
        notes: notes.trim() || undefined,
      })
      setServerNumber("")
      setNotes("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle>Add New Server</DialogTitle>
          <DialogDescription>Create a new server to track clans and members.</DialogDescription>
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
              Add Server
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
