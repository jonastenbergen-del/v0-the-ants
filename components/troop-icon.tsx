import { Shield, Target, Package } from "lucide-react"
import type { TroopType } from "@/lib/types"

interface TroopIconProps {
  type: TroopType
  className?: string
}

export function TroopIcon({ type, className = "size-4" }: TroopIconProps) {
  switch (type) {
    case "G":
      return <Shield className={className} />
    case "S":
      return <Target className={className} />
    case "C":
      return <Package className={className} />
  }
}

export function getTroopLabel(type: TroopType): string {
  switch (type) {
    case "G":
      return "Guard"
    case "S":
      return "Shooter"
    case "C":
      return "Carrier"
  }
}

export function getTroopColor(type: TroopType): string {
  switch (type) {
    case "G":
      return "text-blue-400"
    case "S":
      return "text-red-400"
    case "C":
      return "text-amber-400"
  }
}
