import type { Server, Clan, Member } from "./types"

export interface ExportData {
  version: string
  timestamp: string
  type: "all" | "server" | "clan" | "member"
  data: Server[] | Server | Clan | Member
}

export function exportToJSON(data: ExportData): string {
  return JSON.stringify(data, null, 2)
}

export function downloadJSON(data: ExportData, filename: string) {
  const json = exportToJSON(data)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.antsdata`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function validateImportData(data: unknown): { valid: boolean; error?: string } {
  try {
    const parsed = data as ExportData
    if (!parsed.version || !parsed.type || !parsed.data) {
      return { valid: false, error: "Invalid data format" }
    }
    return { valid: true }
  } catch (error) {
    return { valid: false, error: "Failed to parse data" }
  }
}

export function parseImportFile(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        const validation = validateImportData(data)
        if (!validation.valid) {
          reject(new Error(validation.error))
        } else {
          resolve(data as ExportData)
        }
      } catch (error) {
        reject(new Error("Failed to parse file"))
      }
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}
