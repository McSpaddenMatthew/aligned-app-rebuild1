import Link from "next/link";
import { Button } from "@/components/Button";

interface Props {
  fullName?: string | null;
}

export function TopNav({ fullName }: Props) {
  return (
    <nav className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-lg font-semibold">
          Aligned
        </Link>
        <div className="hidden items-center gap-3 text-sm text-slateGray md:flex">
          <Link href="/dashboard" className="hover:text-primaryBlack">
            Dashboard
          </Link>
          <Link href="/settings" className="hover:text-primaryBlack">
            Settings
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden text-sm text-slateGray sm:block">
          {fullName ? `Welcome back, ${fullName}` : "Welcome back"}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lightGray text-sm font-semibold text-primaryBlack">
          {fullName?.charAt(0)?.toUpperCase() ?? "A"}
        </div>
        <form action="/auth/logout" method="post">
          <Button type="submit" variant="ghost" className="text-sm">
            Logout
          </Button>
        </form>
      </div>
    </nav>
  );
}
