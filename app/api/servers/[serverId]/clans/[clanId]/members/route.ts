import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// POST create new member
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string; clanId: string }> }
) {
  const supabase = await createClient()
  const { serverId, clanId } = await params
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { 
    name, 
    mainClass, 
    secondaryClasses, 
    power, 
    activityStatus, 
    mainUnitImage, 
    notes, 
    pvpRole, 
    activeTime,
    unitImages 
  } = body

  // Get server and clan info for history
  const { data: server } = await supabase
    .from("servers")
    .select("server_number")
    .eq("id", serverId)
    .single()

  const { data: clan } = await supabase
    .from("clans")
    .select("name, tag")
    .eq("id", clanId)
    .single()

  // Insert member
  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert({
      name,
      main_class: mainClass,
      power: power || null,
      activity_status: activityStatus || 'unknown',
      main_unit_image: mainUnitImage,
      notes,
      pvp_role: pvpRole,
      active_time: activeTime,
      clan_id: clanId
    })
    .select()
    .single()

  if (memberError) {
    console.error("[v0] Error creating member:", memberError)
    return NextResponse.json({ error: memberError.message }, { status: 500 })
  }

  // Insert secondary classes
  if (secondaryClasses && secondaryClasses.length > 0) {
    const secondaryClassesData = secondaryClasses.map((sc: { type: string; weight: number }) => ({
      member_id: member.id,
      troop_type: sc.type,
      weight: sc.weight || 1
    }))
    await supabase.from("member_secondary_classes").insert(secondaryClassesData)
  }

  // Insert unit images
  if (unitImages && unitImages.length > 0) {
    for (const ui of unitImages) {
      const { data: unitImage, error: uiError } = await supabase
        .from("unit_images")
        .insert({
          member_id: member.id,
          troop_type: ui.troopType,
          main_unit_image: ui.mainUnitImage
        })
        .select()
        .single()

      if (!uiError && ui.secondaryUnitImages && ui.secondaryUnitImages.length > 0) {
        const secondaryImages = ui.secondaryUnitImages.map((url: string, idx: number) => ({
          unit_image_id: unitImage.id,
          image_url: url,
          sort_order: idx
        }))
        await supabase.from("unit_secondary_images").insert(secondaryImages)
      }
    }
  }

  // Return complete member data
  return NextResponse.json({
    id: member.id,
    name: member.name,
    mainClass: member.main_class,
    secondaryClasses: secondaryClasses || [],
    power: member.power,
    activityStatus: member.activity_status,
    mainUnitImage: member.main_unit_image,
    notes: member.notes,
    pvpRole: member.pvp_role,
    activeTime: member.active_time,
    clanHistory: [],
    unitImages: unitImages || []
  })
}
