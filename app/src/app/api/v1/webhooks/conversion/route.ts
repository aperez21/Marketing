import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import type { ConversionPayload } from "@/lib/attribution/resolve";

// bcrypt.compare needs Node's crypto, not the Edge runtime.
export const runtime = "nodejs";

const RATE_LIMIT_PER_MINUTE = 100; // per CLAUDE.md Webhook API rate limit

// In-memory, per-instance sliding window. Fine for a single deployment, but
// not distributed-safe once this runs across multiple serverless instances -
// replace with a shared store (e.g. Upstash Redis) before scaling out.
const rateLimitWindows = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(tenantId: string): boolean {
  const now = Date.now();
  const entry = rateLimitWindows.get(tenantId);
  if (!entry || now - entry.windowStart > 60_000) {
    rateLimitWindows.set(tenantId, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_PER_MINUTE;
}

function supabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Looks up the tenant for a raw API key by its plaintext prefix, then
 * bcrypt-compares the full key against the stored hash. Never compares
 * plaintext keys directly, per CLAUDE.md.
 */
async function resolveTenantFromApiKey(rawKey: string): Promise<string | null> {
  if (rawKey.length < 8) return null;
  const prefix = rawKey.slice(0, 8);
  const admin = supabaseAdmin();

  const { data: candidates } = await admin
    .from("tenant_api_keys")
    .select("tenant_id, key_hash, revoked_at")
    .eq("key_prefix", prefix);

  for (const candidate of candidates ?? []) {
    if (candidate.revoked_at) continue;
    if (await bcrypt.compare(rawKey, candidate.key_hash)) {
      return candidate.tenant_id as string;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const [scheme, rawKey] = authHeader.split(" ");
  if (scheme !== "Bearer" || !rawKey) {
    return NextResponse.json(
      { error: "Missing or malformed Authorization header" },
      { status: 401 }
    );
  }

  const tenantId = await resolveTenantFromApiKey(rawKey);
  if (!tenantId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  if (isRateLimited(tenantId)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let payload: ConversionPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload.conversion_type || !payload.external_user_id || !payload.converted_at) {
    return NextResponse.json(
      { error: "conversion_type, external_user_id, and converted_at are required" },
      { status: 400 }
    );
  }

  // Hand off to the process-conversion edge function for resolution + insert,
  // so this handler returns 202 immediately without blocking the tenant's
  // checkout (per CLAUDE.md). Fire-and-forget: errors are logged, not awaited.
  const functionsUrl = `${process.env.SUPABASE_URL}/functions/v1/process-conversion`;
  fetch(functionsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ tenant_id: tenantId, payload }),
  }).catch((err) => {
    console.error("process-conversion invoke failed", err);
  });

  return NextResponse.json({ status: "accepted" }, { status: 202 });
}
