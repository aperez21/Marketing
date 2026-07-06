import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Sign-out route. Called via a <form action="/auth/signout" method="POST">
 * from any page. Clears the Supabase session and redirects to /login.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/login";
  redirectUrl.search = "";
  return NextResponse.redirect(redirectUrl);
}
