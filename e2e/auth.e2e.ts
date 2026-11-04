//Auth E2E tester. Disse testene bruker Playwright for å simulere brukerinteraksjoner med innloggingssiden og registreringsskjemaet.
//Vi sjekker at innloggingssiden vises korrekt, at feil vises ved ugyldig innlogging, og at registreringsskjemaet kan åpnes.
//Vi bruker Playwrights test-API for å navigere til siden, fylle ut skjemaer, klikke på knapper og sjekke at elementer er synlige.
import { test, expect } from "@playwright/test";

test.describe("Auth E2E", () => {
  test("viser innloggingssiden", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Gruppe: W-08" })
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Logg inn" })
    ).toBeVisible();
  });

  test("viser feil ved ugyldig innlogging", async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("E-post").fill("ukjent@test.com");
    await page.getByLabel("Passord").fill("feilpassord");

    await page.getByRole("button", { name: "Logg inn" }).click();

    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("kan Apne registreringsskjemaet", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", {
      name: "Opprett bruker",
    }).click();

    await expect(
      page.getByRole("button", { name: "Registrer bruker" })
    ).toBeVisible();

    await expect(
      page.getByLabel("Bekreft passord")
    ).toBeVisible();
  });
});