"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, UsersRound } from "lucide-react";

// `useSearchParams` opts the component out of static prerendering
// unless wrapped in Suspense — same pattern as /login.
export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageInner />
    </Suspense>
  );
}

function SignupPageInner() {
  const searchParams = useSearchParams();
  // When the user lands here from `/join/<token>` we carry the
  // invite token in the query so it survives the signup → email
  // verification → redirect round-trip. `emailRedirectTo` below
  // points back at /join/<token> so the user lands on the redeem
  // step after verifying instead of being dropped on /dashboard.
  const inviteToken = searchParams.get("invite");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    // If we have an invite token, point Supabase's verification
    // email back at the join page so the user can accept after
    // verifying. Without a token, Supabase uses its default
    // redirect (the app root).
    const emailRedirectTo = inviteToken
      ? `${window.location.origin}/join/${encodeURIComponent(inviteToken)}`
      : undefined;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B141A] px-4">
        {/* Background ambient glow */}
        <div className="absolute -top-[20%] -left-[10%] h-[50%] w-[50%] animate-pulse rounded-full bg-emerald-500/10 blur-[120px] duration-1000" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[50%] w-[50%] animate-pulse rounded-full bg-green-500/10 blur-[120px] duration-1000 delay-500" />

        <Card className="relative z-10 w-full max-w-md overflow-hidden border-white/5 bg-[#111B21]/90 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:shadow-[#25D366]/5">
          <div className="absolute inset-x-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#25D366]/50 to-transparent" />
          <CardHeader className="items-center text-center pb-8 pt-10">
            <div className="mb-4 flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#25D366] shadow-lg shadow-[#25D366]/20 transition-transform duration-300 hover:scale-105">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold text-white">
              Check your email
            </CardTitle>
            <CardDescription className="text-zinc-400 mt-2 leading-relaxed">
              We&apos;ve sent a confirmation link to{" "}
              <span className="font-medium text-white">{email}</span>. Please check your
              inbox and click the link to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href={
                inviteToken
                  ? `/login?invite=${encodeURIComponent(inviteToken)}`
                  : "/login"
              }
            >
              <Button
                variant="outline"
                className="h-12 w-full border-white/10 bg-[#202C33] font-semibold text-white transition-all hover:bg-[#202C33]/80 hover:text-white shadow-sm"
              >
                Back to sign in
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B141A] px-4">
      {/* Background ambient glow */}
      <div className="absolute -top-[20%] -left-[10%] h-[50%] w-[50%] animate-pulse rounded-full bg-emerald-500/10 blur-[120px] duration-1000" />
      <div className="absolute -bottom-[20%] -right-[10%] h-[50%] w-[50%] animate-pulse rounded-full bg-green-500/10 blur-[120px] duration-1000 delay-500" />

      <Card className="relative z-10 w-full max-w-md overflow-hidden border-white/5 bg-[#111B21]/90 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:shadow-[#25D366]/5">
        <div className="absolute inset-x-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#25D366]/50 to-transparent" />
        <CardHeader className="items-center text-center pb-6 pt-10">
          <div className="mb-4 flex flex-row items-center justify-center gap-3">
             <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25D366] shadow-lg shadow-emerald-500/20 transition-transform duration-300 hover:scale-105">
               {inviteToken ? (
                 <UsersRound className="h-7 w-7 text-white" />
               ) : (
                 <svg className="h-8 w-8 text-white ml-0.5 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                 </svg>
               )}
             </div>
             <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Autozee.ai
             </h1>
          </div>
          <CardTitle className="text-xl font-semibold text-white">
            {inviteToken ? "Create account & join" : "Create account"}
          </CardTitle>
          <CardDescription className="text-zinc-400 mt-1">
            {inviteToken
              ? "Verify your email, then accept the invitation to join your team."
              : "Get started with Autozee today."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            {error && (
              <div className="animate-in fade-in slide-in-from-top-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 shadow-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <Label htmlFor="fullName" className="text-sm font-medium text-zinc-300">
                Full name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-11 border-white/10 bg-[#202C33] text-white placeholder:text-zinc-500 transition-all focus-visible:border-[#25D366] focus-visible:ring-[#25D366]/30"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-white/10 bg-[#202C33] text-white placeholder:text-zinc-500 transition-all focus-visible:border-[#25D366] focus-visible:ring-[#25D366]/30"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 border-white/10 bg-[#202C33] text-white placeholder:text-zinc-500 transition-all focus-visible:border-[#25D366] focus-visible:ring-[#25D366]/30"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11 border-white/10 bg-[#202C33] text-white placeholder:text-zinc-500 transition-all focus-visible:border-[#25D366] focus-visible:ring-[#25D366]/30"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-4 h-12 w-full bg-[#25D366] font-bold text-[#0B141A] shadow-lg shadow-[#25D366]/20 transition-all hover:bg-[#1DA851] hover:shadow-[#25D366]/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-zinc-400">
            Already have an account?{" "}
            <Link
              href={
                inviteToken
                  ? `/login?invite=${encodeURIComponent(inviteToken)}`
                  : "/login"
              }
              className="text-[#25D366] transition-colors hover:text-[#25D366]/80 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
