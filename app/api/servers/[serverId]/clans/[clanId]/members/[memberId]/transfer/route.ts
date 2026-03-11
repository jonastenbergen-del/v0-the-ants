import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// POST transfer member to another clan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string; clanId: string; memberId: string }> }
) {
  const supabase = await createClient()
  const { clanId: fromClanId, memberId } = await params
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { toClanId, toServerId } = await request.json()

  // Get target clan name
  const { data: toClan } = await supabase
    .from("clans")
    .select("name")
    .eq("id", toClanId)
    .single()

  // Update the member's clan_id
  const { error: updateError } = await supabase
    .from("members")
    .update({ clan_id: toClanId })
    .eq("id", memberId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Close old history entry
  await supabase
    .from("member_clan_history")
    .update({ left_at: new Date().toISOString() })
    .eq("member_id", memberId)
    .eq("clan_id", fromClanId)
    .is("left_at", null)

  // Create new history entry
  await supabase.from("member_clan_history").insert({
    member_id: memberId,
    clan_id: toClanId,
    clan_name: toClan?.name || "Unknown",
    joined_at: new Date().toISOString()
  })

  return NextResponse.json({ success: true })
}
