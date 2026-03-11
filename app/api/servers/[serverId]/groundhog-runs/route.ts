import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// POST create new groundhog run
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

  const { date, images } = await request.json()

  // Insert groundhog run
  const { data: run, error: runError } = await supabase
    .from("groundhog_runs")
    .insert({
      server_id: serverId,
      date
    })
    .select()
    .single()

  if (runError) {
    return NextResponse.json({ error: runError.message }, { status: 500 })
  }

  // Insert images
  if (images && images.length > 0) {
    const imageData = images.map((url: string) => ({
      groundhog_run_id: run.id,
      image_url: url
    }))
    await supabase.from("groundhog_run_images").insert(imageData)
  }

  return NextResponse.json({
    id: run.id,
    date: run.date,
    images: images || []
  })
}
