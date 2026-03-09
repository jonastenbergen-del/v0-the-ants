"use client"

import { Button } from "@/components/ui/button"
import { Squirrel } from "lucide-react"
import { useState } from "react"
import { GroundhogDialog } from "@/components/dialogs/groundhog-dialog"

interface GroundhogButtonProps {
  serverId: string
}

export function GroundhogButton({ serverId }: GroundhogButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="gap-2 bg-transparent"
        onClick={() => setOpen(true)}
        title="View Groundhog Runs"
      >
        <Squirrel className="size-4" />
        Groundhog
      </Button>
      <GroundhogDialog open={open} onOpenChange={setOpen} serverId={serverId} />
    </>
  )
}
