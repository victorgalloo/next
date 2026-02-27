"use client";

import { useUser } from "@/hooks/use-user";
import type { Role } from "@/lib/constants";

export function RoleGuard({
  allowed,
  children,
  fallback,
}: {
  allowed: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { profile, loading } = useUser();

  if (loading) return null;
  if (!profile || !allowed.includes(profile.role)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
