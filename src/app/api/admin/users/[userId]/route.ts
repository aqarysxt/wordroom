import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";
import { getServiceClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

interface UserRow {
  id: string;
  full_name: string;
  pin_code: string | null;
}

async function getUserProtection(userId: string) {
  const supabase = getServiceClient();
  const [{ data: user, error: userError }, { count, error: ownerError }] = await Promise.all([
    supabase
      .from("wordroom_users")
      .select("id, full_name, pin_code")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("cabinets")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", userId),
  ]);

  if (userError) throw userError;
  if (ownerError) throw ownerError;

  const typedUser = user as UserRow | null;
  const adminFullName = (process.env.ADMIN_FULL_NAME || "aqarys").trim().toLowerCase();
  const isAdminName = typedUser?.full_name.trim().toLowerCase() === adminFullName;

  return {
    user: typedUser,
    isProtected: isAdminName || (count ?? 0) > 0,
    ownerCabinetCount: count ?? 0,
  };
}

async function requireAdmin(accessCode: unknown) {
  if (typeof accessCode !== "string" || accessCode.trim().length === 0) {
    return false;
  }
  return verifyAdmin(accessCode.trim());
}

export async function PATCH(req: Request, { params }: { params: { userId: string } }) {
  try {
    const { accessCode, action, fullName } = await req.json();
    const isAdmin = await requireAdmin(accessCode);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin code дұрыс емес." }, { status: 401 });
    }

    const { user, isProtected } = await getUserProtection(params.userId);
    if (!user) {
      return NextResponse.json({ error: "User табылмады." }, { status: 404 });
    }

    const supabase = getServiceClient();

    if (action === "rename") {
      if (typeof fullName !== "string" || fullName.trim().length < 2) {
        return NextResponse.json({ error: "Жаңа аты-жөнін дұрыс енгізіңіз." }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("wordroom_users")
        .update({ full_name: fullName.trim() })
        .eq("id", params.userId)
        .select("id, full_name, pin_code, created_at")
        .single();

      if (error) throw error;
      return NextResponse.json({ user: data });
    }

    if (action === "block") {
      if (isProtected) {
        return NextResponse.json(
          { error: "Admin немесе кабинет owner user-ді block жасауға болмайды." },
          { status: 400 },
        );
      }

      const { data, error } = await supabase
        .from("wordroom_users")
        .update({ pin_code: null })
        .eq("id", params.userId)
        .select("id, full_name, pin_code, created_at")
        .single();

      if (error) throw error;
      return NextResponse.json({ user: data });
    }

    return NextResponse.json({ error: "Белгісіз action." }, { status: 400 });
  } catch (err) {
    console.error("PATCH /api/admin/users/[userId]", err);
    return NextResponse.json({ error: "User өзгерту мүмкін болмады." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { userId: string } }) {
  try {
    const { accessCode, confirmText } = await req.json();
    const isAdmin = await requireAdmin(accessCode);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin code дұрыс емес." }, { status: 401 });
    }

    const { user, isProtected } = await getUserProtection(params.userId);
    if (!user) {
      return NextResponse.json({ error: "User табылмады." }, { status: 404 });
    }

    if (isProtected) {
      return NextResponse.json(
        { error: "Admin немесе кабинет owner user-ді өшіруге болмайды." },
        { status: 400 },
      );
    }

    if (confirmText !== user.full_name) {
      return NextResponse.json({ error: "Өшіру үшін user атын дәл растаңыз." }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { error } = await supabase.from("wordroom_users").delete().eq("id", params.userId);
    if (error) throw error;

    return NextResponse.json({ deleted: true, user_id: params.userId });
  } catch (err) {
    console.error("DELETE /api/admin/users/[userId]", err);
    return NextResponse.json({ error: "User өшіру мүмкін болмады." }, { status: 500 });
  }
}
