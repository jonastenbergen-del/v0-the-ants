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

  const { name } = await request.json()

  const { data: clan, error } = await supabase
    .from("clans")
    .update({ name })
    .eq("id", clanId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(clan)
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
