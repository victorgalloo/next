"use client";

import { useUser } from "@/hooks/use-user";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Cargando...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={profile.role} />
      <div className="flex-1 flex flex-col">
        <Header
          userId={user.id}
          fullName={profile.full_name}
          role={profile.role}
        />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>
      <MobileNav role={profile.role} />
      <Toaster position="top-right" />
    </div>
  );
}
