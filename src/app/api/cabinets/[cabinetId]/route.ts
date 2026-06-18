import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

// GET /api/cabinets/[cabinetId]  — бір кабинет туралы мәлімет
export async function GET(_req: Request, { params }: { params: { cabinetId: string } }) {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("cabinets")
      .select("*")
      .eq("id", params.cabinetId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Кабинет табылмады." }, { status: 404 });
    }

    const { count, error: countError } = await supabase
      .from("cabinet_members")
      .select("*", { count: "exact", head: true })
      .eq("cabinet_id", params.cabinetId);

    if (countError) throw countError;

    return NextResponse.json({ cabinet: { ...data, member_count: count ?? 0 } });
  } catch (err) {
    console.error("GET /api/cabinets/[cabinetId]", err);
    return NextResponse.json({ error: "Кабинетті жүктеу мүмкін болмады." }, { status: 500 });
  }
}
