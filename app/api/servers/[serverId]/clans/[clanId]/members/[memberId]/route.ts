import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// PUT update member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string; clanId: string; memberId: string }> }
) {
  const supabase = await createClient()
  const { memberId } = await params
  
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

  // Build update object with only provided fields
  const updateData: Record<string, any> = {}
  if (name !== undefined) updateData.name = name
  if (mainClass !== undefined) updateData.main_class = mainClass
  if (power !== undefined) updateData.power = power
  if (activityStatus !== undefined) updateData.activity_status = activityStatus
  if (mainUnitImage !== undefined) updateData.main_unit_image = mainUnitImage
  if (notes !== undefined) updateData.notes = notes
  if (pvpRole !== undefined) updateData.pvp_role = pvpRole
  if (activeTime !== undefined) updateData.active_time = activeTime

  // Update member
  const { error: memberError } = await supabase
    .from("members")
    .update(updateData)
    .eq("id", memberId)

  if (memberError) {
    console.error("[v0] Error updating member:", memberError)
    return NextResponse.json({ error: memberError.message }, { status: 500 })
  }

  // Update secondary classes if provided - delete old, insert new
  if (secondaryClasses !== undefined) {
    await supabase.from("member_secondary_classes").delete().eq("member_id", memberId)
    if (secondaryClasses && secondaryClasses.length > 0) {
      const secondaryClassesData = secondaryClasses.map((sc: { type: string; weight: number }) => ({
        member_id: memberId,
        troop_type: sc.type,
        weight: sc.weight || 1
      }))
      await supabase.from("member_secondary_classes").insert(secondaryClassesData)
    }
  }

  // Update unit images if provided - delete old, insert new
  if (unitImages !== undefined) {
    // First get existing unit images to delete secondary images
    const { data: existingUnitImages } = await supabase
      .from("unit_images")
      .select("id")
      .eq("member_id", memberId)

    if (existingUnitImages) {
      for (const ui of existingUnitImages) {
        await supabase.from("unit_secondary_images").delete().eq("unit_image_id", ui.id)
      }
    }
    await supabase.from("unit_images").delete().eq("member_id", memberId)

    // Insert new unit images
    if (unitImages && unitImages.length > 0) {
      for (const ui of unitImages) {
        const { data: unitImage, error: uiError } = await supabase
          .from("unit_images")
          .insert({
            member_id: memberId,
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
  }

  return NextResponse.json({ success: true })
}

// DELETE member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string; clanId: string; memberId: string }> }
) {
  const supabase = await createClient()
  const { memberId } = await params
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error } = await supabase
    .from("members")
    .delete()
    .eq("id", memberId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
