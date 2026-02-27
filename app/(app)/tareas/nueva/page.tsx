import { TaskForm } from "@/components/tasks/task-form";

export default function NuevaTareaPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Nueva tarea</h1>
      <TaskForm />
    </div>
  );
}
