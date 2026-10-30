"use client";

import { useEffect, useState } from "react";
import { ProfileMenu } from "@/features/student/components/ProfileMenu";

import {
  getLocations,
  getFloorReport,
  reviewFloorReport,
  type Building,
  type Floor,
  type FloorReport,
} from "../ansatt-api";

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

export function AnsattSide() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);

  const [buildingId, setBuildingId] = useState<number | null>(null);
  const [floorId, setFloorId] = useState<number | null>(null);

  const [year, setYear] = useState(current.year);
  const [week, setWeek] = useState(current.week);

  const [report, setReport] = useState<FloorReport | null>(null);

  const [checks, setChecks] = useState<boolean[]>(Array(5).fill(false));

  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const availableFloors = floors.filter(
    (floor) => floor.buildingId === buildingId,
  );

  const selectedBuilding = buildings.find(
    (building) => building.id === buildingId,
  );

  const selectedFloor = floors.find((floor) => floor.id === floorId);

  const weekStart = mondayOfWeek(year, week);

  const reviewed = report !== null && report.status !== "pending";

  useEffect(() => {
    let active = true;

    async function loadLocations() {
      try {
        const data = await getLocations();

        if (!active) return;

        setBuildings(data.buildings);
        setFloors(data.floors);

        const firstBuilding = data.buildings[0];

        if (firstBuilding) {
          setBuildingId(firstBuilding.id);

          const firstFloor = data.floors.find(
            (floor) => floor.buildingId === firstBuilding.id,
          );

          setFloorId(firstFloor?.id ?? null);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Kunne ikke hente bygninger",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadLocations();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (floorId === null) {
      setReport(null);
      return;
    }

    let active = true;

    setLoading(true);
    setError("");
    setReport(null);
    setChecks(Array(5).fill(false));
    setComment("");

    async function loadReport() {
      try {
        const data = await getFloorReport(floorId!, weekStart);

        if (!active) return;

        setReport(data);
        setChecks(data.checks);
        setComment(data.comment);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Kunne ikke hente rapport",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadReport();

    return () => {
      active = false;
    };
  }, [floorId, weekStart]);

  function changeBuilding(value: string) {
    const nextBuildingId = Number(value);

    setBuildingId(nextBuildingId);

    const firstFloor = floors.find(
      (floor) => floor.buildingId === nextBuildingId,
    );

    setFloorId(firstFloor?.id ?? null);
  }

  function toggleTask(index: number) {
    if (reviewed || saving || loading) return;

    setChecks((previous) =>
      previous.map((checked, i) => (i === index ? !checked : checked)),
    );
  }

  async function handleReview(approved: boolean) {
    if (floorId === null || !report || reviewed || saving || loading) {
      return;
    }

    if (!comment.trim()) {
      setError("Du må skrive en kommentar");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updated = await reviewFloorReport(
        floorId,
        weekStart,
        approved,
        checks,
        comment,
      );

      setReport(updated);
      setChecks(updated.checks);
      setComment(updated.comment);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Kunne ikke lagre vurderingen",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 font-sans text-slate-900">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-700">Gruppe W-08</p>

            <h1 className="mt-1 text-3xl font-bold">Ansatt – vaskekontroll</h1>

            <p className="mt-2 text-slate-600">
              Gjennomgå og vurder studentenes ukentlige vaskerapporter.
            </p>
          </div>

          <ProfileMenu />
        </header>

        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-xl font-bold">Velg bygning og etasje</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Bygning
              <select
                value={buildingId ?? ""}
                onChange={(e) => changeBuilding(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              >
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium">
              Etasje
              <select
                value={floorId ?? ""}
                onChange={(e) => setFloorId(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              >
                {availableFloors.map((floor) => (
                  <option key={floor.id} value={floor.id}>
                    Etasje {floor.number}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Ukentlig vaskerapport</h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedBuilding?.name ?? "Bygning"}
                {" · "}
                Etasje {selectedFloor?.number ?? ""}
                {" · "}
                Uke {week}
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <label className="block text-sm font-medium">
                År
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
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

              <label className="block text-sm font-medium">
                Uke
                <select
                  value={week}
                  onChange={(e) => setWeek(Number(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
                >
                  {Array.from({ length: 53 }, (_, i) => i + 1).map((number) => (
                    <option key={number} value={number}>
                      Uke {number}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {loading && (
            <p className="mt-4 text-sm text-slate-500">Laster rapport ...</p>
          )}

          <div className="mt-6 space-y-3">
            {(report?.tasks ?? []).map((task, index) => (
              <label
                key={task.title}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={checks[index] ?? false}
                  onChange={() => toggleTask(index)}
                  disabled={reviewed || saving || loading}
                  className="size-5 shrink-0 accent-blue-600"
                />

                <div className="flex-1">
                  <p className="font-medium text-slate-900">{task.title}</p>

                  <p className="mt-1 text-sm text-slate-500">
                    {task.description}
                  </p>
                </div>

                <span
                  className={`shrink-0 text-xs font-semibold ${
                    checks[index] ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {checks[index] ? "Utført" : "Ikke utført"}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium">
              Kommentar til etasjen
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Skriv hva som må gjøres på nytt ..."
                rows={3}
                disabled={reviewed || saving || loading}
                className="mt-2 w-full rounded-lg border border-slate-300 p-3 disabled:bg-slate-100"
              />
            </label>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleReview(true)}
                disabled={reviewed || saving || loading || !report}
                className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50"
              >
                {saving ? "Lagrer ..." : "Godkjenn rapport"}
              </button>

              <button
                type="button"
                onClick={() => handleReview(false)}
                disabled={reviewed || saving || loading || !report}
                className="rounded-lg bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800 disabled:opacity-50"
              >
                Avvis rapport
              </button>
            </div>

            {reviewed && (
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  report?.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {report?.status === "approved" ? "Godkjent" : "Avvist"}
              </span>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
