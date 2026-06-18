import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

// POST /api/users — аты мен 4 сандық код бойынша кіру немесе жаңа қолданушы құру
export async function POST(req: Request) {
  try {
    const { fullName, accessCode } = await req.json();

    if (typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json({ error: "Аты-жөніңізді дұрыс енгізіңіз." }, { status: 400 });
    }
    if (typeof accessCode !== "string" || !/^\d{4}$/.test(accessCode)) {
      return NextResponse.json({ error: "4 сандық кодты дұрыс енгізіңіз." }, { status: 400 });
    }

    const cleanFullName = fullName.trim();
    const supabase = getServiceClient();

    const { data: existingUser, error: findError } = await supabase
      .from("wordroom_users")
      .select("id, full_name, created_at")
      .eq("full_name", cleanFullName)
      .eq("pin_code", accessCode)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (findError) throw findError;

    if (existingUser) {
      return NextResponse.json({ user: existingUser });
    }

    const { data: blockedUser, error: blockedError } = await supabase
      .from("wordroom_users")
      .select("id")
      .eq("full_name", cleanFullName)
      .is("pin_code", null)
      .limit(1)
      .maybeSingle();

    if (blockedError) throw blockedError;

    if (blockedUser) {
      return NextResponse.json({ error: "Бұл user бұғатталған." }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("wordroom_users")
      .insert({ full_name: cleanFullName, pin_code: accessCode })
      .select("id, full_name, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({ user: data }, { status: 201 });
  } catch (err) {
    console.error("POST /api/users", err);
    return NextResponse.json({ error: "Қолданушыны құру мүмкін болмады." }, { status: 500 });
  }
}
