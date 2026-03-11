import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET all servers with nested data
export async function GET() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: servers, error } = await supabase
    .from("servers")
    .select(`
      *,
      clans (
        *,
        members (
          *,
          member_secondary_classes (*),
          member_clan_history (*),
          unit_images (
            *,
            unit_secondary_images (*)
          )
        )
      ),
      groundhog_runs (
        *,
        groundhog_run_images (*)
      )
    `)
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform data to match existing frontend format
  const transformedServers = servers?.map(server => ({
    id: server.id,
    name: server.name,
    clans: server.clans?.map((clan: any) => ({
      id: clan.id,
      name: clan.name,
      members: clan.members?.map((member: any) => ({
        id: member.id,
        name: member.name,
        mainClass: member.main_class,
        secondaryClasses: member.member_secondary_classes?.map((sc: any) => sc.class_name) || [],
        profileImage: member.profile_image,
        power: member.power,
        kills: member.kills,
        clanHistory: member.member_clan_history?.map((ch: any) => ({
          id: ch.id,
          clanId: ch.clan_id,
          clanName: ch.clan_name,
          joinedAt: ch.joined_at,
          leftAt: ch.left_at || undefined
        })) || [],
        unitImages: member.unit_images?.map((ui: any) => ({
          id: ui.id,
          troopType: ui.troop_type,
          mainUnitImage: ui.main_unit_image,
          secondaryUnitImages: ui.unit_secondary_images?.map((usi: any) => usi.image_url) || []
        })) || []
      })) || []
    })) || [],
    groundhogRuns: server.groundhog_runs?.map((run: any) => ({
      id: run.id,
      date: run.date,
      images: run.groundhog_run_images?.map((img: any) => img.image_url) || []
    })) || []
  })) || []

  return NextResponse.json(transformedServers)
}

// POST create new server
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name } = await request.json()

  const { data: server, error } = await supabase
    .from("servers")
    .insert({ name })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    id: server.id,
    name: server.name,
    clans: [],
    groundhogRuns: []
  })
}
