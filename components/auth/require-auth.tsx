"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth, type AccountType } from "@/components/auth/auth-provider";

interface RequireAuthProps {
  children: ReactNode;
  requireRole?: AccountType;
  fallback?: ReactNode;
}

function RequireAuth({ children, requireRole, fallback }: RequireAuthProps) {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }
    if (status === "authenticated" && requireRole && user?.accountType !== requireRole) {
      if (user?.accountType === "lister") {
        router.push("/owner");
      } else {
        router.push("/dashboard");
      }
    }
  }, [status, requireRole, user, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#014BAA] border-t-transparent" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return fallback ?? (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-[15px] font-medium text-[#172B3F]">Please sign in to continue.</p>
        <a href="/sign-in" className="inline-flex h-11 items-center rounded-xl bg-[#014BAA] px-5 text-sm font-semibold text-white">Sign in</a>
      </div>
    );
  }

  if (requireRole && user?.accountType !== requireRole) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-[15px] font-medium text-[#172B3F]">This page is for {requireRole === "lister" ? "property listers" : "home seekers"} only.</p>
        <a href={user?.accountType === "lister" ? "/owner" : "/dashboard"} className="inline-flex h-11 items-center rounded-xl bg-[#014BAA] px-5 text-sm font-semibold text-white">Go to your dashboard</a>
      </div>
    );
  }

  return <>{children}</>;
}

export { RequireAuth };