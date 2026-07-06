import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type TenantSession = {
  userId: string;
  email: string | undefined;
  tenantId: string;
  tenantRole: string;
};

/**
 * Reads tenant_id / tenant_role from the verified JWT claims (populated by
 * the custom_access_token_hook). Returns null if there's no session, or if
 * the session exists but has no tenant_users row yet.
 */
export async function getTenantSession(): Promise<TenantSession | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data) {
    return null;
  }

  const { claims } = data;
  const tenantId = claims.tenant_id as string | null;
  const tenantRole = claims.tenant_role as string | null;

  if (!tenantId || !tenantRole) {
    return null;
  }

  return {
    userId: claims.sub,
    email: claims.email as string | undefined,
    tenantId,
    tenantRole,
  };
}

/**
 * Redirects to /login if there's no authenticated session at all, or to
 * /no-access if the user is authenticated but has no tenant_users row yet
 * (expected for a first-time Google login before an admin invites them —
 * tenant invitation is a Phase 5 concern, not built yet).
 */
export async function requireTenantSession(): Promise<TenantSession> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data) {
    redirect("/login");
  }

  const { claims } = data;
  const tenantId = claims.tenant_id as string | null;
  const tenantRole = claims.tenant_role as string | null;

  if (!tenantId || !tenantRole) {
    redirect("/no-access");
  }

  return {
    userId: claims.sub,
    email: claims.email as string | undefined,
    tenantId,
    tenantRole,
  };
}
