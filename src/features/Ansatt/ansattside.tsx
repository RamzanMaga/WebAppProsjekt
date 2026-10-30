//Side for ansatte som skal vurdere studentenes vaskerapporter. 
// Inneholder dropdowns for å velge bygning, etasje, gruppe og uke, 
// samt en liste over oppgaver med avkrysningsbokser og en tekstboks for kommentarer. 
// Ansatte kan godkjenne eller avvise rapporten

"use client";

import { useState } from "react";
import { ProfileMenu } from "@/features/student/components/ProfileMenu";

// Definerer antall etasjer for hver bygning
const buildings: Record<string, number> = {
  "Bygg A": 4,
  "Bygg B": 4,
  "Bygg C": 4,
  "Bygg D": 4,
  "Tårnet": 16,
  "Stadion": 5,
};

// Liste over oppgaver som skal vurderes i vaskerapporten
const tasks = [
  {
    title: "Støvsuge med tibehør",
    description: "Inkluderer koketopp, stekebrett og kjøkkenvifte.",
  },
  {
    title: "Kjøkkenbenk",
    description: "Inkluderer veggen over benken, vask og kran.",
  },
  {
    title: "Søppel",
    description: "Skal tas ut før hver vaskesjekk.",
  },
  {
    title: "Gulv",
    description: "Skal støvsuges og vaskes.",
  },
    {
    title: "Fellesareal",
    description: "Ryddes og vaskes.",
  },
];
// Hovedkomponent for ansatt-siden
export function AnsattSide() {
  const [building, setBuilding] = useState("Bygg A");
  const [floor, setFloor] = useState("1");
  const [group, setGroup] = useState("Gruppe 1");
  const [week, setWeek] = useState("1");
  const [checks, setChecks] = useState<boolean[]>([true, true, false, true]);
  const [decision, setDecision] = useState("");
  const [comment, setComment] = useState("");

// Funksjon for å endre valgt bygning
  function changeBuilding(value: string) {
    setBuilding(value);
    setFloor("1");
    setGroup("Gruppe 1");
    setDecision("");
    setChecks([true, true, false, true]);
  }

// Funksjon for å endre valgt uke
  function changeWeek(value: string) {
    setWeek(value);
    setDecision("");
    setComment("");
    setChecks([true, true, false, true]);
  }

//funksjon for å endre valgt gruppe
  function changeGroup(value: string) {
    setGroup(value);
    setDecision("");
    setComment("");
    setChecks([true, true, false, true]);
  }

// Funksjon for å endre status på en oppgave
  function toggleTask(index: number) {
    setChecks((previous) =>
      previous.map((checked, i) => i === index ? !checked : checked)
    );
    setDecision("");
  }

// Funksjon for å godkjenne eller avvise rapporten
  function reviewReport(status: "Godkjent" | "Avvist") {
    setDecision(status);
  }

// Returnerer JSX for ansatt-siden
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 font-sans text-slate-900">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              Gruppe W-08
            </p>
            <h1 className="mt-1 text-3xl font-bold">
              Ansatt – vaskekontroll
            </h1>
            <p className="mt-2 text-slate-600">
              Gjennomgå og vurder studentenes ukentlige vaskerapporter.
            </p>
          </div>
          <ProfileMenu /> 
        </header>

        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-xl font-bold">Velg gruppe</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Bygning
              <select
                value={building}
                onChange={(e) => changeBuilding(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              > 
                {Object.keys(buildings).map((name) => ( //lager en dropdown-meny med bygningene som er definert i buildings-objektet. Hver bygning blir representert som et alternativ i menyen.
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium">
              Etasje
              <select
                value={floor}
                onChange={(e) => {
                  setFloor(e.target.value);
                  setGroup("Gruppe 1");
                  setDecision("");
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              >
                {Array.from( //array.from brukes til å lage en array med et gitt antall elementer, som representerer etasjene i den valgte bygningen. Hver etasje blir deretter representert som et alternativ i dropdown-menyen.
                  { length: buildings[building] },
                  (_, i) => String(i + 1)
                ).map((number) => ( 
                  <option key={number} value={number}>
                    Etasje {number}
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
                {building} · Etasje {floor} · Uke {week}
              </p>
            </div>
            <label className="block text-sm font-medium">
              Uke
              <select
                value={week}
                onChange={(e) => changeWeek(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              >
                {Array.from({ length: 20 }, (_, i) => String(i + 1)).map( //lager en array med 20 elementer som representerer ukene. Hver uke blir deretter representert som et alternativ i dropdown-menyen.
                  (number) => (
                    <option key={number} value={number}>
                      Uke {number}
                    </option>
                  )
                )}
              </select>
            </label>

          </div>

          <div className="mt-6 space-y-3">
           
{tasks.map((task, index) => ( 
  <label
    key={task.title}
    className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
  >
    <input
      type="checkbox"
      checked={checks[index]}
      onChange={() => toggleTask(index)}
      className="size-5 shrink-0 accent-blue-600"
    />

    <div className="flex-1">
      <p className="font-medium text-slate-900">
        {task.title}
      </p>
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
              Kommentar til gruppen
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Skriv hva som må gjøres på nytt ..."
                rows={3}
                className="mt-2 w-full rounded-lg border border-slate-300 p-3"
              />
            </label>
          </div>

                    <div className="mt-6 flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => reviewReport("Godkjent")}
                className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
              >
                Godkjenn rapport
              </button>

              <button
                type="button"
                onClick={() => reviewReport("Avvist")}
                className="rounded-lg bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800"
              >
                Avvis rapport
              </button>
            </div>

            {decision && (
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                decision === "Godkjent"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {decision}
              </span>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}