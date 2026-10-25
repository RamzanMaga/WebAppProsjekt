//Dette her er en fil som laster inn en komponent som håndterer innlogging og registrering.
//Er det en bruker som er logget inn, så vil den redirecte til /student. 
// Hvis ikke, så vil den vise innloggingsskjemaet eller registreringsskjemaet.
//Kjæres på klienten, og ikke på serveren. 

"use client";

import { useEffect, useState } from "react"; //Bruker useEffect for å sjekke om brukeren er logget inn, og useState for å se om brukeren er logget inn eller ikke.
import { getCurrentUser, logoutUser, type UserDTO } from "../auth-api"; 
import { LoginForm } from "./LoginForm"; //Importerer LoginForm komponenten

import { RegisterForm } from "./RegisterForm"; //Importerer RegisterForm komponenten

export function AuthPageClient() { //Eksporterer AuthPageClient komponenten
  const [mode, setMode] = useState<"login" | "register">("login"); //Usestate for å sjekke om brukeren er i login eller register mode.
  const [user, setUser] = useState<UserDTO | null>(null); 
  const [loading, setLoading] = useState(true); 
  
  
  useEffect(() => {
     let active = true; 
     
     getCurrentUser().then(result => {
       if (active) { 
        if (result.ok) {
           window.location.replace("/student");
            return; 
          }
            
            setLoading(false);
           } });
           
           return () => {
             active = false;
             };
           }, []);

            if (loading) 
              return <p className="text-slate-600">Laster inn…</p>;

            if (user) 
              return <div className="w-full max-w-md rounded-2xl bg-white p-8 
              text-center shadow-xl ring-1 ring-slate-200">
             <h1 className="text-3xl font-bold">Gruppe: W-08</h1>
    
            <p className="mt-5 text-green-700" role="status">Du er logget inn!</p>
   
             <p className="mt-2 text-slate-700">Velkommen, {user.firstName}!</p>
    
            <p className="text-sm text-slate-500">{user.email}</p>
    
            <p className="mt-4 text-sm text-slate-500">Neste steg: Vi bygger siden som vises etter innlogging.</p>
    
            <button onClick={async () => { 
              const result = await logoutUser();
              
              if (result.ok) {
                 setUser(null);
                  setMode("login");
                  }
               }}
                className="mt-6 w-full rounded-lg bg-blue-600 p-3 
                font-semibold text-white">Logg ut</button>
  </div>;
  
  return mode === "login" ? (
  <LoginForm 
  onRegister={() => setMode("register")}
  onLogin={() => window.location.assign("/student")} />
   ) : (
     <RegisterForm onBack={() => setMode("login")} />
   );
}
