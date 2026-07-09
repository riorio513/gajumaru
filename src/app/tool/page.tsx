import { createClient } from "@/lib/supabase/server";
import ToolApp from "@/components/ToolApp";

export default async function ToolPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <ToolApp userId={user?.id ?? null} />;
}
