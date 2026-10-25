//Denne filen er nesten identisk med LoginForm.tsx, men den brukes for å registrere en ny bruker i stedet for å logge inn.
// Den har også et ekstra inputfelt for å bekrefte passordet, og to dropdown-menyene for å velge bygning og etasje.

"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getLocations, registerUser, type LocationData } 
from "../auth-api";
import { InputField } from "./InputField";

export function RegisterForm({ onBack }: { onBack: () => void }) 
{
  const [locations, setLocations] = useState<LocationData>({ 
    buildings: [], 
    floors: [] 
  });

  const [buildingId, setBuildingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;

    getLocations().then(result => {
      if (!active) return;

      if (result.ok) 
        setLocations(result.data);
      else setError(result.error.message);
    });
    
    return () => {
       active = false;
       };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); 
    
    setError("");
     setSuccess("");
      setPending(true);

    const data = new FormData(event.currentTarget);

    const result = await registerUser({
      firstName: String(data.get("firstName")),
      lastName: String(data.get("lastName")),
      email: String(data.get("email")),
      password: String(data.get("password")),
      confirmPassword: String(data.get("confirmPassword")),
      buildingId: Number(data.get("buildingId")),
      floorId: Number(data.get("floorId")),
    });

    setPending(false);

    if (!result.ok) {
       setError(
        result.error.message + 
        (result.error.fieldErrors
           ? ": " + 
           Object.values(result.error.fieldErrors).flat().join(", ")
            : "")
          );
           return;
           }

    setSuccess("Brukeren er opprettet! Gå tilbake og logg inn.");
    (event.target as HTMLFormElement).reset();
     setBuildingId("");
  }

  return (
  <div className="w-full max-w-lg rounded-2xl bg-white p-7 
  shadow-xl ring-1 ring-slate-200 sm:p-8">
    <h1 className="text-center text-3xl font-bold text-slate-900">G
      ruppe: W-08
      </h1>

    <p className="mt-2 text-center text-slate-500">
      Opprett en ny brukerkonto
      </p>

    <form onSubmit={submit} 
    className="mt-6 space-y-4">

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

        <InputField 
        label="Fornavn" 
        name="firstName" 
        autoComplete="given-name" 
        placeholder="Fornavn" />

        <InputField 
        label="Etternavn" 
        name="lastName" 
        autoComplete="family-name" 
        placeholder="Etternavn" 
        />
      </div>

      <InputField 
      label="E-post"
      name="email" 
      type="email" 
      autoComplete="email" 
      placeholder="din@epost.no"
      />

      <InputField 
      label="Passord (minst 8 tegn)" 
      name="password" 
      type="password" 
      minLength={8} 
      autoComplete="new-password" 
      />

      <InputField 
      label="Bekreft passord" 
      name="confirmPassword" 
      type="password" 
      autoComplete="new-password" 
      />

      <label className="block text-sm font-medium text-slate-700">
        Bygning

        <select 
        name="buildingId"
         required 
         value={buildingId} 
         onChange={e => setBuildingId(e.target.value)}
          className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white p-3">
          <option value="">Velg bygning</option>

          {locations.buildings.map(b => (
            <option key={b.id} value={b.id}>
              {b.name}
              </option>
            ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Etasje

        <select 
        key={buildingId} 
        name="floorId" 
        required 
        disabled={!buildingId} 
        defaultValue="" 
        className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white p-3 disabled:opacity-50">
          
          <option value="">Velg etasje</option>

          {locations.floors.filter
          (f => f.buildingId === Number(buildingId))
          .map(f => (
             <option key={f.id}>
               value={f.id} Etasje
                {f.number}
                </option>
              ))}
        </select>
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
          </p>
        )}

      {success && (
         <p role="status" className="text-sm text-green-700">
          {success}
          </p>
          )}

      <button disabled={pending || !!success}
       className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
        {pending ? "Registrerer…" : "Registrer bruker"}
        </button>
    </form>
    <button onClick={onBack} 
    className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-3 font-semibold hover:bg-slate-50">
      Tilbake til innlogging
      </button>
  </div>
  );
}
