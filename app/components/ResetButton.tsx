"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetButton() {
  const supabase = createClient();
  const router = useRouter();

  async function handleReset() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({ xp: 0, level: 1 }).eq("id", user.id);
    await supabase.from("skills").update({ xp: 0, level: 1 }).eq("user_id", user.id);
    await supabase.from("user_rewards").delete().eq("user_id", user.id);
    router.refresh();
  }

  return (
    <button onClick={handleReset} className="text-[var(--red)] text-xs hover:underline">
      Reset levels
    </button>
  );
}
