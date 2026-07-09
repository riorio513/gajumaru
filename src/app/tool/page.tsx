import { createClient } from "@/lib/supabase/server";
import ToolApp from "@/components/ToolApp";
import { ADMIN_EMAIL } from "@/lib/admin";

export default async function ToolPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <ToolApp userId={user?.id ?? null} isAdmin={user?.email === ADMIN_EMAIL} />;
}
