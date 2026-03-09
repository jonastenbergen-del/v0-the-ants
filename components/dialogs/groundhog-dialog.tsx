"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAntsStore } from "@/lib/store"
import { Calendar, Upload, X, Trash2, ImageIcon, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface GroundhogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  serverId: string
}

export function GroundhogDialog({ open, onOpenChange, serverId }: GroundhogDialogProps) {
  const { servers, addGroundhogRun, deleteGroundhogRun } = useAntsStore()
  const server = servers.find((s) => s.id === serverId)

  const [newRunDate, setNewRunDate] = useState("")
  const [newRunImages, setNewRunImages] = useState<string[]>([])
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const groundhogRuns = server?.groundhogRuns || []
  const sortedRuns = [...groundhogRuns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const selectedRun = sortedRuns.find((run) => run.id === selectedRunId)

  const handlePrevImage = () => {
    if (lightboxIndex !== null && selectedRun) {
      setLightboxIndex((lightboxIndex - 1 + selectedRun.images.length) % selectedRun.images.length)
    }
  }

  const handleNextImage = () => {
    if (lightboxIndex !== null && selectedRun) {
      setLightboxIndex((lightboxIndex + 1) % selectedRun.images.length)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewRunImages((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleCreateRun = () => {
    if (newRunDate && newRunImages.length > 0) {
      addGroundhogRun(serverId, newRunDate, newRunImages)
      setNewRunDate("")
      setNewRunImages([])
    }
  }

  const handleDeleteRun = (runId: string) => {
    deleteGroundhogRun(serverId, runId)
    if (selectedRunId === runId) {
      setSelectedRunId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[99998vw] max-h-[95vh] overflow-hidden bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl">Groundhog Runs - Server {server?.serverNumber}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-[380px_1fr] gap-6 h-[850px]">
            {/* Left column: Form and run list */}
            <div className="flex flex-col gap-4 overflow-y-auto scroll-red pr-2">
              <Card className="border-2 border-dashed border-primary/30 bg-card/50 p-4">
                <h3 className="mb-3 text-base font-semibold text-foreground">New Groundhog Run</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="run-date" className="text-sm">
                      Date *
                    </Label>
                    <Input
                      id="run-date"
                      type="date"
                      value={newRunDate}
                      onChange={(e) => setNewRunDate(e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="run-images" className="text-sm">
                      Images * ({newRunImages.length} selected)
                    </Label>
                    <Input
                      id="run-images"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => document.getElementById("run-images")?.click()}
                    >
                      <Upload className="mr-2 size-4" />
                      Upload Images
                    </Button>

                    {newRunImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-1">
                        {newRunImages.map((img, idx) => (
                          <div key={idx} className="relative aspect-square">
                            <img
                              src={img || "/placeholder.svg"}
                              alt={`Preview ${idx + 1}`}
                              className="size-full rounded object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setNewRunImages((prev) => prev.filter((_, i) => i !== idx))}
                              className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleCreateRun}
                    disabled={!newRunDate || newRunImages.length === 0}
                    className="w-full bg-primary text-primary-foreground"
                    size="sm"
                  >
                    Create Run
                  </Button>
                </div>
              </Card>

              <div className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">All Runs ({sortedRuns.length})</h3>
                {sortedRuns.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">No Groundhog runs yet</p>
                ) : (
                  sortedRuns.map((run) => (
                    <Card
                      key={run.id}
                      className={cn(
                        "cursor-pointer border-2 p-3 transition-all hover:border-primary/50",
                        selectedRunId === run.id ? "border-primary bg-primary/5" : "border-border",
                      )}
                      onClick={() => setSelectedRunId(run.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Calendar className="size-4" />
                            {formatDate(run.date)}
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <ImageIcon className="size-3" />
                            {run.images.length} image{run.images.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteRun(run.id)
                          }}
                          className="size-8 p-0 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Right column: Image gallery */}
            <div className="flex flex-col overflow-hidden rounded-lg border-2 border-border bg-muted/30">
              {selectedRun ? (
                <div className="flex flex-col h-full">
                  <div className="shrink-0 border-b-2 border-border bg-card p-4">
                    <h3 className="text-lg font-semibold text-foreground">RUN - {formatDate(selectedRun.date)}</h3>
                    <p className="text-sm text-muted-foreground">{selectedRun.images.length} images uploaded</p>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="flex gap-4 p-6">
                      {selectedRun.images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setLightboxIndex(idx)}
                          className="group relative shrink-0 overflow-hidden rounded-lg border-2 border-border bg-card transition-all hover:border-primary hover:shadow-lg cursor-pointer"
                          style={{ width: "500px", height: "500px" }}
                        >
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`Groundhog ${idx + 1}`}
                            className="size-full object-contain transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="flex flex-col items-center gap-2">
                              <ZoomIn className="size-10 text-white" />
                              <span className="text-lg font-medium text-white">Click für großes Bild</span>
                            </div>
                          </div>
                          <div className="absolute bottom-3 right-3 rounded-md bg-black/80 px-3 py-1.5 text-sm font-medium text-white">
                            {idx + 1} / {selectedRun.images.length}
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div className="space-y-3">
                    <ImageIcon className="mx-auto size-20 text-muted-foreground/50" />
                    <p className="text-lg text-muted-foreground">Select a run to view images</p>
                    <p className="text-sm text-muted-foreground/70">Click on any run from the list</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {lightboxIndex !== null && selectedRun && (
        <Dialog open={lightboxIndex !== null} onOpenChange={() => setLightboxIndex(null)}>
          <DialogContent className="max-w-[99vw] max-h-[99vh] p-0 bg-black/98 border-none">
            <div className="relative flex items-center justify-center w-full h-[99vh]">
              {/* Main image */}
              <img
                src={selectedRun.images[lightboxIndex] || "/placeholder.svg"}
                alt={`Full size ${lightboxIndex + 1}`}
                className="max-w-[90vw] max-h-[90vh] object-contain"
              />

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full size-14"
                onClick={() => setLightboxIndex(null)}
              >
                <X className="size-8" />
              </Button>

              {/* Image counter */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/80 px-4 py-2 text-lg font-medium text-white">
                {lightboxIndex + 1} / {selectedRun.images.length}
              </div>

              {/* Previous button */}
              {selectedRun.images.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full size-16"
                  onClick={handlePrevImage}
                >
                  <ChevronLeft className="size-10" />
                </Button>
              )}

              {/* Next button */}
              {selectedRun.images.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full size-16"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="size-10" />
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
