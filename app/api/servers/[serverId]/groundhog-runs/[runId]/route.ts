import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// DELETE groundhog run
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string; runId: string }> }
) {
  const supabase = await createClient()
  const { runId } = await params
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error } = await supabase
    .from("groundhog_runs")
    .delete()
    .eq("id", runId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
