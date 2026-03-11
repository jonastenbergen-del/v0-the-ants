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
    serverNumber: server.server_number,
    notes: server.notes,
    clans: server.clans?.map((clan: any) => ({
      id: clan.id,
      name: clan.name,
      tag: clan.tag,
      language: clan.language,
      activeTimeWindow: clan.active_time_window,
      pvpFocus: clan.pvp_focus,
      notes: clan.notes,
      members: clan.members?.map((member: any) => ({
        id: member.id,
        name: member.name,
        mainClass: member.main_class,
        secondaryClasses: member.member_secondary_classes?.map((sc: any) => ({ 
          type: sc.troop_type, 
          weight: sc.weight 
        })) || [],
        power: member.power,
        activityStatus: member.activity_status || 'unknown',
        mainUnitImage: member.main_unit_image,
        notes: member.notes,
        pvpRole: member.pvp_role,
        activeTime: member.active_time,
        clanHistory: member.member_clan_history?.map((ch: any) => ({
          serverNumber: ch.server_number,
          serverName: ch.server_name,
          clanName: ch.clan_name,
          clanTag: ch.clan_tag,
          startDate: ch.start_date,
          endDate: ch.end_date,
          note: ch.note
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
      date: run.run_date,
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

  const { serverNumber, notes } = await request.json()

  const { data: server, error } = await supabase
    .from("servers")
    .insert({ server_number: serverNumber, notes })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating server:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    id: server.id,
    serverNumber: server.server_number,
    notes: server.notes,
    clans: [],
    groundhogRuns: []
  })
}
