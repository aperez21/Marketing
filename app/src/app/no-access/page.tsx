export default function NoAccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-lg font-semibold">No tenant access yet</h1>
        <p className="text-sm text-neutral-500 mt-2">
          You&apos;re signed in, but your account isn&apos;t linked to a
          tenant yet. Ask an admin to invite you, then try again.
        </p>
        <form action="/auth/signout" method="POST" className="mt-6">
          <button
            type="submit"
            className="text-sm underline text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
