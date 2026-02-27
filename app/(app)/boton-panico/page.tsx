import { PanicButton } from "@/components/panic/panic-button";

export default function BotonPanicoPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-2">Boton de Panico</h1>
      <PanicButton />
    </div>
  );
}
