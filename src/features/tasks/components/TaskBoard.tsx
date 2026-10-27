"use client";

import { useCallback, useEffect, useState } from "react";
import {
  completeWeeklyTask,
  createTask,
  createWeeklyPlan,
  deleteTask,
  getTasks,
  getWeeklyPlan,
  reviewWeeklyPlan,
  updateTask,
  type Task,
  type WeeklyPlanWithItems,
} from "../task-api";

const inputClass =
  "rounded-lg border border-slate-300 px-3 py-2 text-slate-900";

const btnClass =
  "rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-40";

const secondaryClass =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-40";

// Finn mandagen i uken for en bestemt dato.
function getMonday(date: Date): string {
  const result = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );

  const day = result.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;

  result.setUTCDate(result.getUTCDate() - daysSinceMonday);

  return result.toISOString().slice(0, 10);
}

// Flytt ukevisningen frem eller tilbake.
function moveWeek(weekStart: string, amount: number): string {
  const date = new Date(`${weekStart}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount * 7);
  return date.toISOString().slice(0, 10);
}

// Finn norsk ukenummer.
function getWeekNumber(weekStart: string): number {
  const date = new Date(`${weekStart}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 3);

  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));

  const firstDay = firstThursday.getUTCDay() || 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() + 4 - firstDay);

  return (
    1 +
    Math.round(
      (date.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000),
    )
  );
}

// Leser brukerdata fra den eksisterende innloggingsøkten.
type CurrentUser = {
  id: number;
  role: string;
  floorId: number | null;
};

// Henter og kontrollerer brukeren fra innlogget økt.
async function getCurrentUser(): Promise<CurrentUser> {
  const response = await fetch("/api/v1/auth/me");

  if (!response.ok) {
    throw new Error("Kunne ikke hente innlogget bruker");
  }

  const result: unknown = await response.json();

  // Kontroller at svaret inneholder brukerdata.
  if (
    typeof result !== "object" ||
    result === null ||
    !("ok" in result) ||
    result.ok !== true ||
    !("data" in result) ||
    typeof result.data !== "object" ||
    result.data === null
  ) {
    throw new Error("Ugyldig brukerdata");
  }

  const data = result.data;

  // Kontroller typene før brukerdata returneres.
  if (
    !("id" in data) ||
    typeof data.id !== "number" ||
    !("role" in data) ||
    typeof data.role !== "string" ||
    !("floorId" in data)
  ) {
    throw new Error("Ugyldig brukerdata");
  }

  return {
    id: data.id,
    role: data.role,
    floorId: typeof data.floorId === "number" ? data.floorId : null,
  };
}

export function TaskBoard() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [plan, setPlan] = useState<WeeklyPlanWithItems | null>(null);

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));

  const [title, setTitle] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Ansatt vurderer hele etasjen, ikke enkeltoppgaver.
  const [report, setReport] = useState("");
  const [approved, setApproved] = useState(true);

  // Hent bruker, standardoppgaver og valgt ukeplan.
  const load = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();

      // Hent standardoppgavene for brukerens etasje.
      const standardTasks = await getTasks();

      // Studenter oppretter ukeplanen automatisk ved behov.
      // Oppgavene fordeles tilfeldig på serveren.
      // Ansatte kan bare lese ukeplanen og vurdere renholdet.
      if (currentUser.role === "student") {
        await createWeeklyPlan(weekStart);
      }

      // Hent ukeplanen etter at den automatiske fordelingen er utført.
      const weeklyPlan = await getWeeklyPlan(weekStart);

      setUser(currentUser);
      setTasks(standardTasks);
      setPlan(weeklyPlan);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ukjent feil");
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    void load();
  }, [load]);

  // Utfør en endring og hent oppdaterte data etterpå.
  async function mutate(run: () => Promise<unknown>) {
    setBusy(true);
    setError("");

    try {
      await run();
      await load();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ukjent feil");
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (loading && !user) {
    return (
      <section className="mt-6 rounded-xl bg-white p-6">
        Henter vaskelisten…
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mt-6 rounded-xl bg-white p-6">
        <p role="alert" className="text-red-700">
          {error || "Du må være logget inn"}
        </p>
      </section>
    );
  }

  const isStudent = user.role === "student";
  const isStaff = user.role === "ansatt";

  const items = plan?.items ?? [];
  const completedCount = items.filter(
    (item) => item.status === "completed",
  ).length;

  const isEditable = !plan || plan.reviewStatus === "pending";

  const isCurrentWeek = weekStart === getMonday(new Date());

  return (
    <section className="mt-6 space-y-5">
      {/* Standardoppgaver for etasjen */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h3 className="text-xl font-bold text-slate-900">
          Vaskeliste for etasjen
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          Studentene fordeler vaskeoppgavene mellom seg hver uke. Ansatt
          vurderer renholdet for hele etasjen.
        </p>

        <p className="mt-2 text-sm text-slate-500">
          {tasks.length} standardoppgaver
        </p>

        {/* Studenter kan opprette og redigere standardoppgaver. */}
        {isStudent && (
          <form
            className="mt-5 flex flex-wrap items-end gap-2"
            onSubmit={async (event) => {
              event.preventDefault();

              const ok = await mutate(() =>
                editing === null
                  ? createTask({ title })
                  : updateTask(editing, { title }),
              );

              if (ok) {
                setTitle("");
                setEditing(null);
              }
            }}
          >
            <label className="flex min-w-52 flex-1 flex-col gap-1 text-sm font-medium">
              Vaskeoppgave
              <input
                className={inputClass}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={160}
                required
                placeholder="F.eks. vaske kjøkkenet"
              />
            </label>

            <button className={btnClass} disabled={busy || !title.trim()}>
              {editing === null ? "Legg til" : "Lagre endring"}
            </button>

            {editing !== null && (
              <button
                type="button"
                className={secondaryClass}
                onClick={() => {
                  setEditing(null);
                  setTitle("");
                }}
              >
                Avbryt
              </button>
            )}
          </form>
        )}

        <ul className="mt-4 divide-y divide-slate-100">
          {tasks.map((task) => (
            <li
              className="flex flex-wrap items-center gap-2 py-2"
              key={task.id}
            >
              <span className="flex-1 text-sm">{task.title}</span>

              {isStudent && (
                <>
                  <button
                    className={secondaryClass}
                    disabled={busy}
                    onClick={() => {
                      setEditing(task.id);
                      setTitle(task.title);
                    }}
                  >
                    Rediger
                  </button>

                  <button
                    className={secondaryClass}
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm(`Slette «${task.title}»?`)) {
                        void mutate(() => deleteTask(task.id));
                      }
                    }}
                  >
                    Fjern
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>

        {tasks.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">
            Ingen standardoppgaver ennå.
          </p>
        )}
      </div>

      {/* Navigasjon mellom kalenderuker */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-3">
          <button
            className={secondaryClass}
            disabled={busy}
            onClick={() => setWeekStart((value) => moveWeek(value, -1))}
          >
            ← Forrige
          </button>

          <div className="text-center">
            <h3 className="text-xl font-bold">
              Uke {getWeekNumber(weekStart)}
            </h3>
            <p className="text-xs text-slate-500">
              {weekStart}
              {isCurrentWeek ? " · Denne uken" : ""}
            </p>
          </div>

          <button
            className={secondaryClass}
            disabled={busy}
            onClick={() => setWeekStart((value) => moveWeek(value, 1))}
          >
            Neste →
          </button>
        </div>

        {/* Fremdriften viser fullførte oppgaver, ikke godkjenninger. */}
        <p className="mt-4 text-sm text-slate-600">
          {completedCount} av {items.length} oppgaver fullført
        </p>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-green-600"
            style={{
              width: `${
                items.length ? (completedCount / items.length) * 100 : 0
              }%`,
            }}
          />
        </div>

        {/* Ukens oppgaver */}
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li
              className="rounded-lg border border-slate-200 p-4"
              key={item.id}
            >
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{item.titles}</p>

                  <p className="text-sm text-slate-600">
                    Ansvarlig: Student #{item.studentFirstName}{" "}
                    {item.studentLastName}
                  </p>
                </div>

                <span className="text-sm font-medium">
                  {item.status === "completed" ? "Fullført" : "Ikke gjort"}
                </span>
              </div>

              {/* Bare oppgavens eier kan fullføre oppgaven. */}
              {isStudent &&
                isEditable &&
                item.userId === user.id &&
                item.status === "todo" && (
                  <button
                    className={`${btnClass} mt-3`}
                    disabled={busy}
                    onClick={() =>
                      void mutate(() => completeWeeklyTask(item.id))
                    }
                  >
                    Marker som utført
                  </button>
                )}
            </li>
          ))}
        </ul>

        {items.length === 0 && (
          <p className="mt-5 text-sm text-slate-500">
            Ingen oppgaver fordelt for denne uken.
          </p>
        )}

        {/* Vurderingen gjelder hele ukeplanen. */}
        {plan && plan.reviewStatus !== "pending" && (
          <div className="mt-5 rounded-lg border border-slate-200 p-4">
            <p className="font-semibold">
              {plan.reviewStatus === "approved" ? "Godkjent" : "Ikke godkjent"}
            </p>

            {plan.ansattRapport && (
              <p className="mt-2 text-sm text-slate-700">
                {plan.ansattRapport}
              </p>
            )}
          </div>
        )}

        {/* Bare ansatt kan vurdere hele etasjen. */}
        {isStaff && plan && isEditable && (
          <div className="mt-5 rounded-lg border border-slate-200 p-4">
            <h4 className="font-semibold">Vurder renholdet i etasjen</h4>

            <label className="mt-3 flex flex-col gap-1 text-sm">
              Vurdering
              <select
                className={inputClass}
                value={approved ? "approved" : "rejected"}
                onChange={(event) =>
                  setApproved(event.target.value === "approved")
                }
              >
                <option value="approved">Godkjent</option>
                <option value="rejected">Ikke godkjent</option>
              </select>
            </label>

            <label className="mt-3 flex flex-col gap-1 text-sm">
              Ansattrapport
              <textarea
                className={inputClass}
                value={report}
                onChange={(event) => setReport(event.target.value)}
                rows={4}
                placeholder="Skriv en vurdering av renholdet"
              />
            </label>

            <button
              className={`${btnClass} mt-3`}
              disabled={busy || !report.trim()}
              onClick={() =>
                void mutate(() =>
                  reviewWeeklyPlan(plan.id, {
                    approved,
                    report,
                  }),
                )
              }
            >
              Lagre vurdering
            </button>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
