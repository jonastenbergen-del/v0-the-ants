import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// PUT update server
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  const supabase = await createClient()
  const { serverId } = await params
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { serverNumber, notes } = await request.json()

  const updateData: Record<string, string | undefined> = {}
  if (serverNumber !== undefined) updateData.server_number = serverNumber
  if (notes !== undefined) updateData.notes = notes

  const { data: server, error } = await supabase
    .from("servers")
    .update(updateData)
    .eq("id", serverId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    id: server.id,
    serverNumber: server.server_number,
    notes: server.notes
  })
}

// DELETE server
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  const supabase = await createClient()
  const { serverId } = await params
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error } = await supabase
    .from("servers")
    .delete()
    .eq("id", serverId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
