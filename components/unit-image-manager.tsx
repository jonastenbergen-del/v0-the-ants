"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Upload, ZoomIn, X, Loader2 } from "lucide-react"
import type { TroopType, UnitImage } from "@/lib/types"
import { TroopIcon, getTroopColor, getTroopLabel } from "./troop-icon"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useBlobUpload } from "@/hooks/use-blob-upload"

interface UnitImageManagerProps {
  unitImages: UnitImage[]
  onChange: (images: UnitImage[]) => void
}

export function UnitImageManager({ unitImages, onChange }: UnitImageManagerProps) {
  const [selectedTroopType, setSelectedTroopType] = useState<TroopType>("G")
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [uploadingUnitId, setUploadingUnitId] = useState<string | null>(null)
  const [uploadingType, setUploadingType] = useState<"main" | "secondary" | null>(null)
  const { uploadFile, deleteFile, state } = useBlobUpload()

  const handleAddUnit = () => {
    const newUnit: UnitImage = {
      id: crypto.randomUUID(),
      troopType: selectedTroopType,
    }
    onChange([...unitImages, newUnit])
  }

  const handleRemoveUnit = async (id: string) => {
    const unit = unitImages.find((img) => img.id === id)
    if (unit) {
      // Delete images from blob storage
      if (unit.mainUnitImage) {
        await deleteFile(unit.mainUnitImage)
      }
      if (unit.secondaryUnitImages) {
        for (const img of unit.secondaryUnitImages) {
          await deleteFile(img)
        }
      }
    }
    onChange(unitImages.filter((img) => img.id !== id))
  }

  const handleMainImageUpload = async (id: string, file: File) => {
    setUploadingUnitId(id)
    setUploadingType("main")
    
    const url = await uploadFile(file)
    
    if (url) {
      const updatedImages = unitImages.map((img) =>
        img.id === id ? { ...img, mainUnitImage: url } : img,
      )
      onChange(updatedImages)
    }
    
    setUploadingUnitId(null)
    setUploadingType(null)
  }

  const handleSecondaryImageUpload = async (id: string, file: File) => {
    setUploadingUnitId(id)
    setUploadingType("secondary")
    
    const url = await uploadFile(file)
    
    if (url) {
      const updatedImages = unitImages.map((img) => {
        if (img.id === id) {
          return {
            ...img,
            secondaryUnitImages: [...(img.secondaryUnitImages || []), url],
          }
        }
        return img
      })
      onChange(updatedImages)
    }
    
    setUploadingUnitId(null)
    setUploadingType(null)
  }

  const handleRemoveSecondaryImage = async (unitId: string, imageIndex: number) => {
    const unit = unitImages.find((img) => img.id === unitId)
    const imageUrl = unit?.secondaryUnitImages?.[imageIndex]
    
    if (imageUrl) {
      await deleteFile(imageUrl)
    }
    
    const updatedImages = unitImages.map((img) => {
      if (img.id === unitId) {
        return {
          ...img,
          secondaryUnitImages: img.secondaryUnitImages?.filter((_, idx) => idx !== imageIndex),
        }
      }
      return img
    })
    onChange(updatedImages)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-2">
          <Label htmlFor="troopType">Select Troop Type</Label>
          <Select value={selectedTroopType} onValueChange={(v) => setSelectedTroopType(v as TroopType)}>
            <SelectTrigger id="troopType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="G">{getTroopLabel("G")}</SelectItem>
              <SelectItem value="S">{getTroopLabel("S")}</SelectItem>
              <SelectItem value="C">{getTroopLabel("C")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="button" onClick={handleAddUnit} className="gap-2">
          <Plus className="size-4" />
          Add Unit Configuration
        </Button>
      </div>

      <div className="max-h-96 space-y-3 overflow-y-auto scroll-red">
        {unitImages.length === 0 ? (
          <Card className="border-2 border-dashed border-border bg-muted/20 p-8 text-center">
            <Upload className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No unit configurations yet</p>
            <p className="text-xs text-muted-foreground">Add a unit to upload images</p>
          </Card>
        ) : (
          unitImages.map((unit) => (
            <Card key={unit.id} className="border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TroopIcon type={unit.troopType} className={cn("size-5", getTroopColor(unit.troopType))} />
                  <span className="font-semibold text-foreground">{getTroopLabel(unit.troopType)}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveUnit(unit.id)}
                  className="size-8 p-0 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Main Unit Image</Label>
                  {uploadingUnitId === unit.id && uploadingType === "main" ? (
                    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-primary/50 bg-muted/20 p-4">
                      <div className="text-center">
                        <Loader2 className="mx-auto mb-1 size-6 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">Uploading...</p>
                      </div>
                    </div>
                  ) : unit.mainUnitImage ? (
                    <div className="group relative overflow-hidden rounded-lg border border-border">
                      <img
                        src={unit.mainUnitImage || "/placeholder.svg"}
                        alt="Main unit"
                        className="h-auto w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setZoomedImage(unit.mainUnitImage!)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <ZoomIn className="size-6 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-4 transition-colors hover:border-primary/50">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleMainImageUpload(unit.id, file)
                        }}
                      />
                      <div className="text-center">
                        <Upload className="mx-auto mb-1 size-6 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Upload main unit</p>
                      </div>
                    </label>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Secondary Unit Images (Optional)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {unit.secondaryUnitImages?.map((img, idx) => (
                      <div key={idx} className="group relative overflow-hidden rounded-lg border border-border">
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`Secondary unit ${idx + 1}`}
                          className="h-24 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setZoomedImage(img)}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <ZoomIn className="size-5 text-white" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSecondaryImage(unit.id, idx)}
                          className="absolute right-1 top-1 rounded-full bg-black/70 p-1 opacity-0 transition-opacity hover:bg-black group-hover:opacity-100"
                        >
                          <X className="size-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {(!unit.secondaryUnitImages || unit.secondaryUnitImages.length < 6) && (
                      uploadingUnitId === unit.id && uploadingType === "secondary" ? (
                        <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-primary/50 bg-muted/20">
                          <Loader2 className="size-5 animate-spin text-primary" />
                        </div>
                      ) : (
                        <label className="flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 transition-colors hover:border-primary/50">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleSecondaryImageUpload(unit.id, file)
                            }}
                          />
                          <Plus className="size-5 text-muted-foreground" />
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

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
    </div>
  )
}
