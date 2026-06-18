import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";
import { getServiceClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

interface WordroomUser {
  id: string;
  full_name: string;
  pin_code: string | null;
  created_at: string;
}

interface CabinetOwner {
  owner_id: string;
}

async function getCleanupPlan(accessCode: string) {
  const supabase = getServiceClient();
  const [usersRes, cabinetsRes] = await Promise.all([
    supabase.from("wordroom_users").select("id, full_name, pin_code, created_at").order("created_at", { ascending: false }),
    supabase.from("cabinets").select("owner_id"),
  ]);

  if (usersRes.error) throw usersRes.error;
  if (cabinetsRes.error) throw cabinetsRes.error;

  const users = (usersRes.data || []) as WordroomUser[];
  const cabinetOwners = (cabinetsRes.data || []) as CabinetOwner[];
  const ownerIds = new Set(cabinetOwners.map((cabinet) => cabinet.owner_id).filter(Boolean));
  const adminFullName = (process.env.ADMIN_FULL_NAME || "aqarys").trim().toLowerCase();
  const adminCandidates = users
    .filter((user) => user.full_name.trim().toLowerCase() === adminFullName)
    .sort((a, b) => (a.created_at > b.created_at ? 1 : -1));
  const selectedAdmin =
    adminCandidates.find((user) => user.pin_code === accessCode) || adminCandidates[0] || null;
  const selectedAdminId = selectedAdmin?.id || null;

  const deletableUsers = users.filter((user) => !ownerIds.has(user.id) && user.id !== selectedAdminId);
  const keptUsers = users.filter((user) => ownerIds.has(user.id) || user.id === selectedAdminId);

  return {
    users,
    deletableUsers,
    keptUsers,
    ownerCount: ownerIds.size,
    adminKeptCount: selectedAdmin ? 1 : 0,
  };
}

// POST /api/admin/users/cleanup
// action: "preview" | "delete"
export async function POST(req: Request) {
  try {
    const { accessCode, action, confirmText } = await req.json();

    if (typeof accessCode !== "string" || accessCode.trim().length === 0) {
      return NextResponse.json({ error: "Admin code енгізіңіз." }, { status: 400 });
    }

    const isAdmin = await verifyAdmin(accessCode.trim());
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin code дұрыс емес." }, { status: 401 });
    }

    const plan = await getCleanupPlan(accessCode.trim());

    if (action !== "delete") {
      return NextResponse.json({
        mode: "preview",
        deletable_count: plan.deletableUsers.length,
        kept_count: plan.keptUsers.length,
        owner_count: plan.ownerCount,
        admin_kept_count: plan.adminKeptCount,
        deletable_users: plan.deletableUsers.map((user) => ({
          id: user.id,
          full_name: user.full_name,
          created_at: user.created_at,
        })),
      });
    }

    if (confirmText !== "ТАЗАЛАУ") {
      return NextResponse.json({ error: "Растау үшін ТАЗАЛАУ деп жазыңыз." }, { status: 400 });
    }

    if (plan.deletableUsers.length === 0) {
      return NextResponse.json({
        mode: "delete",
        deleted_count: 0,
        kept_count: plan.keptUsers.length,
      });
    }

    const supabase = getServiceClient();
    const deletableIds = plan.deletableUsers.map((user) => user.id);
    const { error } = await supabase.from("wordroom_users").delete().in("id", deletableIds);

    if (error) throw error;

    return NextResponse.json({
      mode: "delete",
      deleted_count: deletableIds.length,
      kept_count: plan.keptUsers.length,
      deleted_users: plan.deletableUsers.map((user) => ({
        id: user.id,
        full_name: user.full_name,
      })),
    });
  } catch (err) {
    console.error("POST /api/admin/users/cleanup", err);
    return NextResponse.json({ error: "User-лерді тазалау мүмкін болмады." }, { status: 500 });
  }
}
