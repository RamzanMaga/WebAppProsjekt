"use client";

import { useEffect, useState } from "react";
import { TaskBoard } from "@/features/tasks/components/TaskBoard";
import { ProfileMenu } from "./ProfileMenu";
import { getMyFloorGroup, type FloorGroup } from "../student-api";

type AnsattReview = {
  status: string;
  comment: string;
  weekStart: string;
};

function mondayOfWeek(year: number, week: number) {
  const januaryFourth = new Date(Date.UTC(year, 0, 4));
  const day = januaryFourth.getUTCDay() || 7;

  const monday = new Date(januaryFourth);
  monday.setUTCDate(januaryFourth.getUTCDate() - day + 1);
  monday.setUTCDate(monday.getUTCDate() + (week - 1) * 7);

  return monday.toISOString().slice(0, 10);
}

function getCurrentWeek() {
  const today = new Date();

  const date = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  );

  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);

  const year = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));

  const week = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );

  return { year, week };
}

const current = getCurrentWeek();

export function StudentDashboard() {
  const [group, setGroup] = useState<FloorGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [year, setYear] = useState(current.year);
  const [week, setWeek] = useState(current.week);

  const [review, setReview] = useState<AnsattReview | null>(null);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");

  const weekStart = mondayOfWeek(year, week);

  useEffect(() => {
    let active = true;

    getMyFloorGroup()
      .then((result) => {
        if (!active) return;

        if (result.ok) {
          setGroup(result.data);
        } else if (result.error.code === "401") {
          window.location.replace("/");
        } else {
          setError(result.error.message);
        }
      })
      .catch(() => {
        if (active) {
          setError("Kunne ikke hente etasjegruppen");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!group) return;

    let active = true;

    setReviewLoading(true);
    setReviewError("");
    setReview(null);

    async function loadReview() {
      try {
        const params = new URLSearchParams({ weekStart });

        const response = await fetch(
          `/api/student/ansatt-review?${params.toString()}`,
          { credentials: "same-origin" },
        );

        const data = (await response.json()) as
          | AnsattReview
          | { error: string };

        if (!response.ok) {
          throw new Error(
            "error" in data ? data.error : "Kunne ikke hente vurderingen",
          );
        }

        if (active) {
          setReview(data as AnsattReview);
        }
      } catch (err) {
        if (active) {
          setReviewError(
            err instanceof Error ? err.message : "Kunne ikke hente vurderingen",
          );
        }
      } finally {
        if (active) setReviewLoading(false);
      }
    }

    loadReview();

    return () => {
      active = false;
    };
  }, [group, weekStart]);

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

          <ProfileMenu />
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

            {/* ANSATT VURDERING */}
            <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Vurdering fra ansatt
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Se vurderingen for din etasje og valgt uke.
                  </p>
                </div>

                <div className="flex gap-3">
                  <label className="text-sm font-medium text-slate-700">
                    År
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2"
                    >
                      {[current.year - 1, current.year, current.year + 1].map(
                        (value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label className="text-sm font-medium text-slate-700">
                    Uke
                    <select
                      value={week}
                      onChange={(e) => setWeek(Number(e.target.value))}
                      className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2"
                    >
                      {Array.from({ length: 53 }, (_, index) => index + 1).map(
                        (value) => (
                          <option key={value} value={value}>
                            Uke {value}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                </div>
              </div>

              {reviewLoading ? (
                <p className="mt-5 text-sm text-slate-500">
                  Henter vurdering ...
                </p>
              ) : reviewError ? (
                <p
                  role="alert"
                  className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700"
                >
                  {reviewError}
                </p>
              ) : review?.status === "pending" ? (
                <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                  Ingen vurdering fra ansatt ennå.
                </p>
              ) : review ? (
                <div className="mt-5 space-y-4">
                  <span
                    className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                      review.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {review.status === "approved" ? "✓ Godkjent" : "✕ Avvist"}
                  </span>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      Kommentar fra ansatt
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-slate-700">
                      {review.comment}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm text-slate-500">
                  Ingen vurdering tilgjengelig.
                </p>
              )}
            </section>

            <TaskBoard />
          </>
        )}
      </div>
    </main>
  );
}
