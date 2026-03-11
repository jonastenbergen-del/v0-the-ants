import type { Server, Clan, Member } from "./types"

export type ExportType = "all" | "server" | "clan" | "member"

export interface ExportData {
  version: string
  timestamp: string
  type: ExportType
  data: Server[] | Server | Clan | Member
}

export function exportToJSON(data: ExportData): string {
  return JSON.stringify(data, null, 2)
}

export function downloadJSON(data: ExportData, filename: string) {
  const json = exportToJSON(data)

  const blob = new Blob([json], {
    type: "application/json",
  })

  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.antsdata.json`

  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function validateImportData(data: unknown): {
  valid: boolean
  error?: string
} {
  if (typeof data !== "object" || data === null) {
    return { valid: false, error: "Data is not an object" }
  }

  const parsed = data as Partial<ExportData>

  if (typeof parsed.version !== "string") {
    return { valid: false, error: "Invalid or missing version" }
  }

  if (typeof parsed.timestamp !== "string") {
    return { valid: false, error: "Invalid or missing timestamp" }
  }

  const validTypes: ExportType[] = ["all", "server", "clan", "member"]

  if (!parsed.type || !validTypes.includes(parsed.type)) {
    return { valid: false, error: "Invalid type field" }
  }

  if (parsed.data === undefined) {
    return { valid: false, error: "Missing data field" }
  }

  return { valid: true }
}

export function parseImportFile(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const result = event.target?.result

        if (typeof result !== "string") {
          reject(new Error("File content is not valid text"))
          return
        }

        const parsed = JSON.parse(result)

        const validation = validateImportData(parsed)

        if (!validation.valid) {
          reject(new Error(validation.error ?? "Invalid import data"))
          return
        }

        resolve(parsed as ExportData)
      } catch {
        reject(new Error("Failed to parse JSON file"))
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsText(file)
  })
}