"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useAntsStore } from "@/lib/store"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import type { SearchResult } from "@/lib/types"
import { cn } from "@/lib/utils"

export function GlobalSearch() {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const { servers, selectServer, selectClan, selectMember } = useAntsStore()
  const searchRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Search logic
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!query.trim() || query.length < 2) return []

    const results: SearchResult[] = []
    const searchTerm = query.toLowerCase()

    servers.forEach((server) => {
      server.clans.forEach((clan) => {
        // Search clans
        if (clan.name.toLowerCase().includes(searchTerm) || clan.tag.toLowerCase().includes(searchTerm)) {
          results.push({ type: "clan", clan, server })
        }

        // Search members
        clan.members.forEach((member) => {
          if (member.name.toLowerCase().includes(searchTerm)) {
            results.push({ type: "member", member, clan, server })
          }
        })
      })
    })

    return results.slice(0, 10) // Limit to 10 results
  }, [query, servers])

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "clan") {
      selectServer(result.server.id)
      selectClan(result.clan.id)
      selectMember(null)
    } else {
      selectServer(result.server.id)
      selectClan(result.clan.id)
      selectMember(result.member.id)
    }
    setQuery("")
    setIsOpen(false)
  }

  const formatPower = (power?: number) => {
    if (!power) return "0"
    if (power >= 1_000_000_000) return `${(power / 1_000_000_000).toFixed(1)}B`
    if (power >= 1_000_000) return `${(power / 1_000_000).toFixed(1)}M`
    if (power >= 1_000) return `${(power / 1_000).toFixed(1)}K`
    return power.toString()
  }

  return (
    <div ref={searchRef} className="relative w-80">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search clans & members..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-9 bg-muted/50"
        />
      </div>

      {/* Results Dropdown */}
      {isOpen && searchResults.length > 0 && (
        <Card className="absolute top-full z-50 mt-2 w-full max-h-[400px] overflow-y-auto border border-border bg-card shadow-lg">
          <div className="p-2">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleResultClick(result)}
                className={cn(
                  "w-full rounded-md p-3 text-left transition-colors hover:bg-accent",
                  "flex items-start gap-3 border-b border-border/50 last:border-b-0",
                )}
              >
                {result.type === "clan" ? (
                  <>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-bold">
                      {result.clan.tag}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{result.clan.name}</span>
                        <span className="text-xs text-muted-foreground">Server {result.server.serverNumber}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{result.clan.members.length} members</span>
                        <span>
                          {formatPower(result.clan.members.reduce((sum, m) => sum + (m.power || 0), 0))} Power
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-lg">
                      {result.member.mainClass}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground">{result.member.name}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Server {result.server.serverNumber}</span>
                        <span>•</span>
                        <span>{result.clan.tag}</span>
                        <span>•</span>
                        <span>{formatPower(result.member.power)} Power</span>
                      </div>
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* No results message */}
      {isOpen && query.length >= 2 && searchResults.length === 0 && (
        <Card className="absolute top-full z-50 mt-2 w-full border border-border bg-card p-4 text-center text-sm text-muted-foreground">
          No results found
        </Card>
      )}
    </div>
  )
}
