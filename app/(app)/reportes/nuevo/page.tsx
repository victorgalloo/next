import { ReportForm } from "@/components/reports/report-form";

export default function NuevoReportePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Nuevo reporte</h1>
      <ReportForm />
    </div>
  );
}
