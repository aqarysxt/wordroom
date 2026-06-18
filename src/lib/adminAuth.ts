import { getServiceClient } from "@/lib/supabaseServer";

export async function verifyAdmin(accessCode: string) {
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
