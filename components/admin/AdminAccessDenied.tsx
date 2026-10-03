"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogOut, ArrowLeft } from "lucide-react";
import { signOut } from "@/lib/auth-client";

interface AdminAccessDeniedProps {
  user: {
    name: string;
    email: string;
  };
}

export default function AdminAccessDenied({ user }: AdminAccessDeniedProps) {
  const router = useRouter();

  const handleSwitchAccount = async () => {
    await signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <main className="min-h-[80vh] px-4 flex items-center justify-center">
      <div className="max-w-md w-full text-center rounded-3xl bg-white p-8 sm:p-10 border border-stone-200 shadow-xl">
        <div className="size-16 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto mb-5 border border-rose-100">
          <ShieldAlert size={32} />
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900">
          Atelier Privileges Required
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
          You are currently signed in as <strong className="font-medium text-neutral-900">{user.email}</strong>, which does not have atelier administrator credentials.
        </p>

        <div className="mt-8 flex flex-col gap-2.5">
          <button
            onClick={handleSwitchAccount}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 py-3 text-xs font-medium text-white hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign In with Administrator Account</span>
          </button>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 py-2.5 text-xs font-medium text-neutral-700 hover:bg-stone-50 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Boutique Homepage</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
