import { AuthPageClient } from "@/features/Auth/Components/AuthPageClient";
export function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 font-sans">
      <AuthPageClient />
    </main>
  );
}
