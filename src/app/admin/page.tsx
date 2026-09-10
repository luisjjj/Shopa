import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerEmail = (process.env.OWNER_EMAIL || "").toLowerCase();
  if (!user || !ownerEmail || user.email?.toLowerCase() !== ownerEmail) {
    redirect("/login");
  }
  return <AdminClient />;
}
