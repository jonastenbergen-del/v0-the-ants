import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// POST create new clan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  const supabase = await createClient()
  const { serverId } = await params
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, tag, language, activeTimeWindow, pvpFocus, notes } = await request.json()

  const { data: clan, error } = await supabase
    .from("clans")
    .insert({ 
      name, 
      tag: tag || name.substring(0, 4).toUpperCase(),
      language: language || 'EN',
      active_time_window: activeTimeWindow || '18:00-23:00',
      pvp_focus: pvpFocus || 'Casual',
      notes,
      server_id: serverId 
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating clan:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    id: clan.id,
    name: clan.name,
    tag: clan.tag,
    language: clan.language,
    activeTimeWindow: clan.active_time_window,
    pvpFocus: clan.pvp_focus,
    notes: clan.notes,
    members: []
  })
}
