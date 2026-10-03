"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Loader2, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Flower2
} from "lucide-react";
import { signIn, signOut } from "@/lib/auth-client";
import { checkAdminStatusAction } from "@/app/admin/actions";
import { toast } from "sonner";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.error) {
        setErrorMessage(res.error.message || "Invalid credentials. Please verify your email and password.");
        setLoading(false);
        return;
      }

      // Verify administrator privilege on server
      const status = await checkAdminStatusAction();

      if (!status.authenticated || !status.isAdmin) {
        // Not an administrator - sign out and inform user
        await signOut();
        setErrorMessage(
          "Access Denied: This account is authenticated as a customer and does not have atelier administrator privileges."
        );
        setLoading(false);
        return;
      }

      toast.success(`Welcome back, ${status.user?.name || "Administrator"}!`);
      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during admin sign-in.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });
    } catch (err: any) {
      toast.error(err?.message || "Google sign in failed");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-stone-800 hover:text-stone-900 transition-colors mb-4 group"
        >
          <div className="size-10 rounded-2xl bg-stone-900 text-stone-100 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Flower2 size={20} className="text-amber-300" />
          </div>
          <span className="font-serif text-2xl tracking-wide">ELVARA</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-[11px] font-semibold tracking-wider uppercase border border-amber-200/60 mb-3">
          <ShieldCheck size={13} className="text-amber-700" />
          <span>Atelier Administration Portal</span>
        </div>

        <h1 className="font-serif text-3xl text-neutral-900">Staff & Studio CMS</h1>
        <p className="text-xs text-neutral-500 mt-2 max-w-sm mx-auto font-light leading-relaxed">
          Sign in with your atelier administrator account to curate floral collections, manage orders, and inspect shop analytics.
        </p>
      </div>

      {/* Card */}
      <div className="rounded-3xl bg-white p-7 sm:p-9 shadow-xl border border-stone-200/80">
        {errorMessage && (
          <div className="mb-6 rounded-2xl bg-rose-50 p-4 border border-rose-100/80 flex items-start gap-3 text-rose-800 text-xs leading-relaxed animate-in fade-in">
            <AlertCircle size={17} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-rose-900">Authentication Alert</p>
              <p className="mt-0.5 text-rose-700">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="curator@elvara.com"
                required
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 py-3 pl-10 pr-4 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-stone-900 focus:outline-hidden transition-all"
              />
              <Mail size={16} className="absolute left-3.5 top-3.5 text-neutral-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-neutral-700">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 py-3 pl-10 pr-10 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-stone-900 focus:outline-hidden transition-all"
              />
              <Lock size={16} className="absolute left-3.5 top-3.5 text-neutral-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-neutral-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-neutral-900 py-3.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 mt-2 group cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Verifying atelier credentials...</span>
              </>
            ) : (
              <>
                <span>Enter Studio CMS</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Google SSO Divider if supported */}
        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
          <>
            <div className="relative my-6 text-center text-xs text-neutral-400">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] uppercase tracking-wider">
                Or authenticate via
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full rounded-full border border-stone-200 py-3 text-xs font-medium text-neutral-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In with Atelier Google Workspace</span>
            </button>
          </>
        )}

        {/* Security Notice */}
        <div className="mt-7 pt-5 border-t border-stone-100 text-center">
          <p className="text-[11px] text-stone-500 font-light flex items-center justify-center gap-1.5">
            <Lock size={12} className="text-stone-400" />
            <span>Encrypted atelier session with server-level access enforcement.</span>
          </p>
        </div>
      </div>

      {/* Return to Store Link */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors font-medium inline-flex items-center gap-1.5"
        >
          <span>← Return to Elvara Boutique Storefront</span>
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-stone-100/60 py-12 px-4 flex flex-col items-center justify-center">
      <Suspense
        fallback={
          <div className="text-center text-neutral-500">
            <Loader2 className="size-8 animate-spin text-stone-600 mb-3 mx-auto" />
            <p className="text-xs font-serif">Loading atelier portal...</p>
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
