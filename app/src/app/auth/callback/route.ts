import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/campaigns";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // nextUrl.clone() preserves basePath handling; plain string
      // concatenation with `origin` would not.
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = next;
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    console.error(
      "[auth/callback] exchangeCodeForSession error:",
      error.name,
      error.message
    );
  }

  const errorUrl = request.nextUrl.clone();
  errorUrl.pathname = "/login";
  errorUrl.search = "?error=auth_callback_failed";
  return NextResponse.redirect(errorUrl);
}
