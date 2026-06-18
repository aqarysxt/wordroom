import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

interface WordroomUser {
  id: string;
  full_name: string;
  pin_code: string | null;
  created_at: string;
}

interface CabinetRow {
  id: string;
  name: string;
  code: string;
  owner_id: string;
  created_at: string;
}

interface MemberRow {
  id: string;
  cabinet_id: string;
  user_id: string;
  created_at: string;
}

interface TopicRow {
  id: string;
  cabinet_id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
}

interface WordRow {
  id: string;
  topic_id: string;
  word: string;
  translation: string;
  meaning: string | null;
  example_sentence: string | null;
  created_at: string;
}

interface PracticeResultRow {
  id: string;
  user_id: string;
  topic_id: string;
  mode: string;
  correct_count: number;
  wrong_count: number;
  completed_at: string;
}

async function verifyAdmin(accessCode: string) {
  if (!accessCode) return false;

  const configuredCode = process.env.ADMIN_ACCESS_CODE;
  if (configuredCode) return accessCode === configuredCode;

  const supabase = getServiceClient();
  const adminFullName = process.env.ADMIN_FULL_NAME || "aqarys";
  const { data, error } = await supabase
    .from("wordroom_users")
    .select("id")
    .ilike("full_name", adminFullName)
    .eq("pin_code", accessCode)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

// POST /api/admin/overview — protected admin overview.
export async function POST(req: Request) {
  try {
    const { accessCode } = await req.json();

    if (typeof accessCode !== "string" || accessCode.trim().length === 0) {
      return NextResponse.json({ error: "Admin code енгізіңіз." }, { status: 400 });
    }

    const isAdmin = await verifyAdmin(accessCode.trim());
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin code дұрыс емес." }, { status: 401 });
    }

    const supabase = getServiceClient();
    const [usersRes, cabinetsRes, membersRes, topicsRes, wordsRes, practiceRes] =
      await Promise.all([
        supabase.from("wordroom_users").select("id, full_name, pin_code, created_at").order("created_at", { ascending: false }),
        supabase.from("cabinets").select("id, name, code, owner_id, created_at").order("created_at", { ascending: false }),
        supabase.from("cabinet_members").select("id, cabinet_id, user_id, created_at").order("created_at", { ascending: false }),
        supabase.from("topics").select("id, cabinet_id, title, description, status, created_at").order("created_at", { ascending: false }),
        supabase.from("words").select("id, topic_id, word, translation, meaning, example_sentence, created_at").order("created_at", { ascending: false }),
        supabase
          .from("practice_results")
          .select("id, user_id, topic_id, mode, correct_count, wrong_count, completed_at")
          .order("completed_at", { ascending: false }),
      ]);

    for (const result of [usersRes, cabinetsRes, membersRes, topicsRes, wordsRes, practiceRes]) {
      if (result.error) throw result.error;
    }

    const users = (usersRes.data || []) as WordroomUser[];
    const cabinets = (cabinetsRes.data || []) as CabinetRow[];
    const members = (membersRes.data || []) as MemberRow[];
    const topics = (topicsRes.data || []) as TopicRow[];
    const words = (wordsRes.data || []) as WordRow[];
    const practiceResults = (practiceRes.data || []) as PracticeResultRow[];

    const usersById = new Map(users.map((user) => [user.id, user]));
    const cabinetsById = new Map(cabinets.map((cabinet) => [cabinet.id, cabinet]));
    const topicsById = new Map(topics.map((topic) => [topic.id, topic]));

    const usersWithStats = users.map((user) => ({
      ...user,
      cabinet_count: members.filter((member) => member.user_id === user.id).length,
      owned_cabinet_count: cabinets.filter((cabinet) => cabinet.owner_id === user.id).length,
      practice_count: practiceResults.filter((result) => result.user_id === user.id).length,
    }));

    const cabinetsWithStats = cabinets.map((cabinet) => {
      const cabinetTopics = topics.filter((topic) => topic.cabinet_id === cabinet.id);
      const topicIds = new Set(cabinetTopics.map((topic) => topic.id));
      return {
        ...cabinet,
        owner_name: usersById.get(cabinet.owner_id)?.full_name || "Белгісіз",
        member_count: members.filter((member) => member.cabinet_id === cabinet.id).length,
        topic_count: cabinetTopics.length,
        word_count: words.filter((word) => topicIds.has(word.topic_id)).length,
      };
    });

    const membersWithNames = members.map((member) => ({
      ...member,
      user_name: usersById.get(member.user_id)?.full_name || "Белгісіз",
      cabinet_name: cabinetsById.get(member.cabinet_id)?.name || "Белгісіз",
      cabinet_code: cabinetsById.get(member.cabinet_id)?.code || "",
    }));

    const topicsWithStats = topics.map((topic) => ({
      ...topic,
      cabinet_name: cabinetsById.get(topic.cabinet_id)?.name || "Белгісіз",
      word_count: words.filter((word) => word.topic_id === topic.id).length,
    }));

    const recentPractice = practiceResults.slice(0, 30).map((result) => {
      const topic = topicsById.get(result.topic_id);
      const cabinet = topic ? cabinetsById.get(topic.cabinet_id) : null;
      return {
        ...result,
        user_name: usersById.get(result.user_id)?.full_name || "Белгісіз",
        topic_title: topic?.title || "Белгісіз",
        cabinet_name: cabinet?.name || "Белгісіз",
      };
    });

    return NextResponse.json({
      stats: {
        user_count: users.length,
        cabinet_count: cabinets.length,
        member_count: members.length,
        topic_count: topics.length,
        word_count: words.length,
        practice_count: practiceResults.length,
      },
      users: usersWithStats,
      cabinets: cabinetsWithStats,
      members: membersWithNames,
      topics: topicsWithStats,
      recentPractice,
    });
  } catch (err) {
    console.error("POST /api/admin/overview", err);
    return NextResponse.json({ error: "Админ деректерін жүктеу мүмкін болмады." }, { status: 500 });
  }
}
