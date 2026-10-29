"use client";
import { useEffect, useState } from "react";
import { TaskBoard } from "@/features/tasks/components/TaskBoard";
import { logoutUser } from "@/features/auth/auth-api";
import { getMyFloorGroup, type FloorGroup } from "../student-api";

export function StudentDashboard() {
  const [group, setGroup] = useState<FloorGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    getMyFloorGroup().then((result) => {
      if (!active) return;
      if (result.ok) setGroup(result.data);
      else if (result.error.code === "401") window.location.replace("/");
      else setError(result.error.message);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  async function signOut() {
    setLoggingOut(true);
    const result = await logoutUser();
    if (result.ok) window.location.replace("/");
    else {
      setError(result.error.message);
      setLoggingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 font-sans">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-700">Gruppe W-08</p>
            <h1 className="text-3xl font-bold text-slate-900">
              Min etasjegruppe
            </h1>
          </div>
          <button
            type="button"
            disabled={loggingOut}
            onClick={signOut}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            {loggingOut ? "Logger ut…" : "Logg ut"}
          </button>
        </header>
        {loading && (
          <p role="status" className="rounded-xl bg-white p-6">
            Henter etasjegruppen din…
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-6 text-red-700">
            {error}
          </p>
        )}
        {group && (
          <>
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm text-slate-500">Hei, {group.firstName}!</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {group.building} · Etasje {group.floor}
              </h2>
              <p className="mt-3 text-slate-600">
                Dette er gruppen din. Du ser bare studenter som er registrert på
                samme bygning og etasje som deg.
              </p>
              <div className="mt-5 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">
                {group.members.length}{" "}
                {group.members.length === 1 ? "medlem" : "medlemmer"}
              </div>
            </section>
            <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-xl font-bold text-slate-900">
                Medlemmer i etasjegruppen
              </h3>
              <ul className="mt-4 divide-y divide-slate-100">
                {group.members.map((member) => (
                  <li key={member.id} className="flex items-center gap-3 py-3">
                    <span
                      aria-hidden
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700"
                    >
                      {member.name.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                    <span className="font-medium text-slate-800">
                      {member.name}
                      {member.id === group.currentUserId && (
                        <span className="ml-2 text-sm font-normal text-slate-500">
                          (deg)
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <TaskBoard />
          </>
        )}
      </div>
    </main>
  );
}
