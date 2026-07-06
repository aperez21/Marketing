import { redirect } from "next/navigation";
import { requireTenantSession } from "@/lib/tenant";

export default async function Home() {
  await requireTenantSession();
  redirect("/campaigns");
}
