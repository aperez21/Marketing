import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getTenantSession } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "Campaign Intelligence Platform",
  description: "Multi-tenant marketing campaign tracking and optimization",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getTenantSession();

  return (
    <html lang="en">
      <body className="antialiased">
        {session && (
          <nav className="border-b px-6 py-3 flex items-center justify-between">
            <Link href="/campaigns" className="font-semibold text-sm">
              Campaign Intelligence Platform
            </Link>
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <span>{session.email}</span>
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Sign out
                </button>
              </form>
            </div>
          </nav>
        )}
        <main>{children}</main>
      </body>
    </html>
  );
}
