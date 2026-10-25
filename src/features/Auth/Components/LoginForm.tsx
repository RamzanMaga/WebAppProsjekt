// I denne koden lager vi et login-skjema som brukere kan bruke for å logge inn på kontoen sin. 
// Skjemaet består av to inputfelt, ett for e-post og ett for passord, som er laget ved hjelp av InputField-komponenten. 
// Når brukeren sender inn skjemaet, kalles submit-funksjonen som håndterer innloggingen
//  ved å sende en forespørsel til loginUser-funksjonen. 
// Hvis innloggingen er vellykket, kalles onLogin-funksjonen med brukerdataene. 
// Hvis det oppstår en feil, vises en feilmelding til brukeren. 
// Skjemaet har også en knapp for å opprette en ny bruker, som kaller onRegister-funksjonen når den trykkes.
"use client";

import { useState, type FormEvent } from "react";
import { loginUser, type UserDTO } from "../auth-api";
import { InputField } from "./InputField";

export function LoginForm({
   onRegister, 
   onLogin 
  }: { 
    onRegister: () => void;
    onLogin: (user: UserDTO) => void;
   }) {
      const [error, setError] = useState("");
      const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);

    const result = await loginUser({ 
      email: String(form.get("email")),
       password: String(form.get("password")) 
      });

    setPending(false);

    if (!result.ok) {
       setError(result.error.message);
        return; 
      }
    
      onLogin(result.data);
  }

  return (
     <div className="w-full max-w-md rounded-2xl bg-white p-8
      shadow-xl ring-1 ring-slate-200">
        <h1 className="text-center text-3xl font-bold text-slate-900">
          Gruppe: W-08
          </h1>

        <p className="mt-2 text-center text-slate-500">
          Logg inn på kontoen din
          </p>
    <form onSubmit={submit} className="mt-7 space-y-4">
      <InputField 
      label="E-post"
      name="email"
      type="email"
      autoComplete="email"
      placeholder="din@epost.no" 
      />

      <InputField 
      label="Passord" 
      name="password" 
      type="password" 
      autoComplete="current-password" 
      placeholder="Passord" 
      />
      
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
          </p>
          )}
          

      <button disabled={pending} 
      className="w-full rounded-lg bg-blue-600 px-4 py-3 
      font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Logger inn…" : "Logg inn"}
        </button>
    </form>

    <button 
    onClick={onRegister}
     className="mt-3 w-full rounded-lg border border-slate-300
      px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50"
      >Opprett bruker</button>
  </div>
  );
}
