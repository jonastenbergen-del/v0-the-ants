// Data types for The Ants Control Center

export type TroopType = "G" | "S" | "C" // Guard, Shooter, Carrier

export interface ClanHistoryEntry {
  serverNumber: string
  serverName?: string
  clanName: string
  clanTag: string
  startDate?: string
  endDate?: string
  note?: string
}

export interface UnitImage {
  id: string
  troopType: TroopType
  mainUnitImage?: string
  secondaryUnitImages?: string[]
}

export interface Member {
  id: string
  name: string
  mainClass: TroopType
  secondaryClasses?: { type: TroopType; weight: number }[]
  power?: number
  activityStatus: "active" | "inactive" | "unknown"
  mainUnitImage?: string
  notes?: string
  pvpRole?: string
  clanHistory?: ClanHistoryEntry[]
  unitImages?: UnitImage[]
  activeTime?: string
}

export interface ClanStats {
  totalMembers: number
  guardPercentage: number
  shooterPercentage: number
  carrierPercentage: number
  totalPower: number
}

export interface Clan {
  id: string
  name: string
  tag: string
  language: "EN" | "DE" | "Mixed" | "Other"
  activeTimeWindow: string // e.g., "18:00-23:00"
  pvpFocus: "Casual" | "Competitive" | "Hardcore"
  members: Member[]
  notes?: string
}

export type MainUnit = "Shooter" | "Guard" | "Carrier" | "Unknown"

export interface GroundhogRun {
  id: string
  date: string // ISO date string
  images: string[] // Base64 or blob URLs
}

export interface Server {
  id: string
  serverNumber: string // e.g., "s1398"
  clans: Clan[]
  notes?: string
  groundhogRuns?: GroundhogRun[]
}

export interface ClanSearchResult {
  type: "clan"
  clan: Clan
  server: Server
}

export interface MemberSearchResult {
  type: "member"
  member: Member
  clan: Clan
  server: Server
}

export type SearchResult = ClanSearchResult | MemberSearchResult
