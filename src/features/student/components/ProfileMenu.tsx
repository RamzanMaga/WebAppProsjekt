
"use client";

import { useState } from "react";
import {
  logoutUser,
  changePassword,
} from "@/features/Auth/auth-api";

export function ProfileMenu() {
  const [page, setPage] = useState("menu");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function savePassword(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("De nye passordene er ikke like");
      return;
    }

    setSaving(true);

    const result = await changePassword({
      oldPassword,
      newPassword,
      confirmPassword,
    });

    setSaving(false);

    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("Passordet har blitt endret");
  }

  async function signOut() {
    const result = await logoutUser();

    if (result.ok) {
      window.location.replace("/");
    } else {
      setMessage(result.error.message);
    }
  }

  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-lg border bg-white px-4 py-2">
        Profil
      </summary>

      <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border bg-white p-4 shadow-lg">

        {page === "menu" ? (
          <div className="space-y-2">
            <h3 className="font-semibold">Min profil</h3>

            <button
              type="button"
              onClick={() => {
                setPage("password");
                setMessage("");
              }}
              className="w-full rounded-lg p-2 text-left hover:bg-slate-100"
            >
              Endre profil
            </button>

            <button
              type="button"
              onClick={signOut}
              className="w-full rounded-lg p-2 text-left text-red-600 hover:bg-red-50"
            >
              Logg ut
            </button>
          </div>
        ) : (
          <form onSubmit={savePassword} className="space-y-3">
            <button
              type="button"
              onClick={() => {
                setPage("menu");
                setMessage("");
              }}
              className="text-sm text-blue-700"
            >
              ← Tilbake
            </button>

            <h3 className="font-semibold">Endre passord</h3>

            <input
              type="password"
              placeholder="Gammelt passord"
              aria-label="Gammelt passord"
              autoComplete="current-password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              required
              className="w-full rounded-lg border p-2"
            />

            <input
              type="password"
              placeholder="Nytt passord"
              aria-label="Nytt passord"
              autoComplete="new-password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              minLength={8}
              required
              className="w-full rounded-lg border p-2"
            />

            <input
              type="password"
              placeholder="Bekreft nytt passord"
              aria-label="Bekreft nytt passord"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-lg border p-2"
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-600 p-2 text-white disabled:opacity-50"
            >
              {saving ? "Lagrer..." : "Lagre passord"}
            </button>
          </form>
        )}

        {message && (
          <p role="status" className="mt-3 text-sm">
            {message}
          </p>
        )}
      </div>
    </details>
  );
}
