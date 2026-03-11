import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// PUT update clan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string; clanId: string }> }
) {
  const supabase = await createClient()
  const { clanId } = await params
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, tag, language, activeTimeWindow, pvpFocus, notes } = await request.json()

  const updateData: Record<string, any> = {}
  if (name !== undefined) updateData.name = name
  if (tag !== undefined) updateData.tag = tag
  if (language !== undefined) updateData.language = language
  if (activeTimeWindow !== undefined) updateData.active_time_window = activeTimeWindow
  if (pvpFocus !== undefined) updateData.pvp_focus = pvpFocus
  if (notes !== undefined) updateData.notes = notes

  const { data: clan, error } = await supabase
    .from("clans")
    .update(updateData)
    .eq("id", clanId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating clan:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    id: clan.id,
    name: clan.name,
    tag: clan.tag,
    language: clan.language,
    activeTimeWindow: clan.active_time_window,
    pvpFocus: clan.pvp_focus,
    notes: clan.notes
  })
}

// DELETE clan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string; clanId: string }> }
) {
  const supabase = await createClient()
  const { clanId } = await params
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error } = await supabase
    .from("clans")
    .delete()
    .eq("id", clanId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
