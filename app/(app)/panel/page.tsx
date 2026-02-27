"use client";

import { useUser } from "@/hooks/use-user";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Skeleton } from "@/components/ui/skeleton";

export default function PanelPage() {
  const { profile, loading } = useUser();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!profile || profile.role !== "director") {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No tienes acceso a esta página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Panel de control</h1>
      <StatsCards schoolId={profile.school_id} />
      <RecentActivity schoolId={profile.school_id} />
    </div>
  );
}
