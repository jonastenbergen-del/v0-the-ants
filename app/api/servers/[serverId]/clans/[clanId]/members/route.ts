import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// POST create new member
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string; clanId: string }> }
) {
  const supabase = await createClient()
  const { clanId } = await params
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { name, mainClass, secondaryClasses, profileImage, power, kills, unitImages } = body

  // Get clan name for history
  const { data: clan } = await supabase
    .from("clans")
    .select("name")
    .eq("id", clanId)
    .single()

  // Insert member
  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert({
      name,
      main_class: mainClass,
      profile_image: profileImage,
      power: power || 0,
      kills: kills || 0,
      clan_id: clanId
    })
    .select()
    .single()

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 })
  }

  // Insert secondary classes
  if (secondaryClasses && secondaryClasses.length > 0) {
    const secondaryClassesData = secondaryClasses.map((className: string) => ({
      member_id: member.id,
      class_name: className
    }))
    await supabase.from("member_secondary_classes").insert(secondaryClassesData)
  }

  // Insert clan history
  await supabase.from("member_clan_history").insert({
    member_id: member.id,
    clan_id: clanId,
    clan_name: clan?.name || "Unknown",
    joined_at: new Date().toISOString()
  })

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
        const secondaryImages = ui.secondaryUnitImages.map((url: string) => ({
          unit_image_id: unitImage.id,
          image_url: url
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
    profileImage: member.profile_image,
    power: member.power,
    kills: member.kills,
    clanHistory: [{
      id: crypto.randomUUID(),
      clanId,
      clanName: clan?.name || "Unknown",
      joinedAt: new Date().toISOString()
    }],
    unitImages: unitImages || []
  })
}
