
# Webapplikasjon Gruppe W-08

Dette er en webapplikasjon som vi har laget for å organisere vaskeoppgaver som må gjøres i studentboligene. Disse kollektivene får en vaskesjekk av SIØ hver uke.

Studenter kan registrere seg, se hvem de bor og deler etasje med, gjennomføre tildelte vaskeoppgaver og sjekke om de har fått godkjent vaskesjekken av SIØ.

Ansatte kan kontrollere om etasjene og kollektivene studentene bor i, er vasket i henhold til deres standard, og skrive og sende rapporter til kollektivene rapportene gjelder.

## For å kjøre webapplikasjonen vår

For å kjøre applikasjonen vår må man ha Node.js og npm installert.

1. Åpne eller klon GitHub-repoet vårt.
2. Når man har åpnet repoet i Visual Studio Code, åpner man terminalen.
3. I terminalen skriver man:
   npm install
4. Etter at npm install er ferdig, skriver man:
   npx wrangler d1 migrations apply webapp-db --local 
5. Deretter skriver man: 
   npx wrangler d1 execute webapp-db --local --file=src/db/seed-locations.sql
6. Så kjører man:
   npx tsx scripts/seed-ansatt.ts
7. Til slutt starter man applikasjonen med:
   npm run dev
   

## Tester

Testene bruker blant annet Vitest og mocking for å kontrollere logikken uten å være avhengig av en ekte database.

### E2E-tester

For å kjøre E2E-testene vi har laget, må man skrive disse to kommandoene i terminalen:


npx playwright install chromium



npm run test:e2e


### Vitest

Vitest-testene våre kan kjøres på forskjellige måter:

- npm run test – Kjører alle testene.
- npm test – Kjører testene en gang.
- npm run test:watch

Eksempel på hvordan man kan kjøre en spesifikk testfil:


npx vitest run src/features/tasks//__tests__/task-service.test.ts --reporter=verbose


## Hovedflyt

### Student

1. Studenten registrerer seg basert på hvilken bygning og etasje de bor i, dersom de ikke bor i en enkelt- eller parleilighet.

2. Etter registrering logger studenten inn med e-postadressen og passordet de registrerte seg med.

3. På studentens innloggede side kan de se de andre studentene som bor i samme kollektiv. Sammen kan de sette opp vaskeoppgaver, som blir fordelt mellom alle i samme gruppe fra uke til uke.

4. Når SIØ har gjennomført en vaskesjekk, kan studentene sjekke om de har fått godkjent vaskesjekken, og lese eventuelle kommentarer fra SIØ-ansatte om hva som ikke ble vasket godt nok.

5. Studenten har en profilmeny der de kan logge ut eller endre passord.

### Ansatt

1. Ansatte skal få tildelt en bruker av admin, men i prosjektet vårt har vi hardkodet en bruker for dem:
   - E-post: ansatt@gmail.com
   - Passord: ansatt123

   De logger inn på samme måte som studentene, men blir sendt til ansattsiden i stedet for studentsiden.

2. På ansattsiden velger de etasje, bygg, uke og år for vaskerapporten, basert på hvem de gjennomfører vaskesjekken hos, og datoen.

3. De huker av for eksempel søppel dersom de godkjenner hvordan søppelhåndteringen i kollektivet ser ut, eller lar det stå uten å huke av dersom de ikke er fornøyde. Deretter skriver de en kommentar og klikker på «Godkjenn rapport» dersom kollektivet har bestått vaskesjekken, eller «Avvis rapport» dersom den ikke er godkjent.

4. Ansatte har en profilmeny der de kan logge ut eller endre passord.

## Prosjektstruktur

Mappe/fil | Innhold 
src/worker.tsx | Hovedruter og kobling til sidene
src/features/Auth/ | Innlogging, registrering og brukere
src/features/student/ | Studentdashboard og etasjegruppe
src/features/tasks/ | Oppgaver, ukeplaner og oppgavefordeling
src/features/Ansatt/ | Ansattdashboard og rengjøringsrapporter
src/db/schema/ | Databasetabeller og skjemaer
src/db/index.ts | Databasetilkobling
drizzle/migrations/ | Databasemigrasjoner
src/features//__tests__/ | Enhets- og komponenttester via Vitest
e2e/ | E2E-tester via Playwright

Innenfor hver feature brukes hovedsakelig:

- Routes/controller: Håndterer API-forespørsler og ruting.
- Service: Inneholder logikken og reglene i applikasjonen.
- Repository: Kommuniserer med databasen.
- Components: Inneholder React-komponentene som vises til brukeren.

## Viktige kodevalg

### 1. Feature-basert struktur

Prosjektet er delt inn i Auth, Student, Tasks og Ansatt. Dette gjør det enklere å finne og vedlikeholde funksjonaliteten.

### 2. Separasjon av ansvar

Vi skiller mellom controller, service og repository, slik at API-håndtering, forretningslogikk og databaseoperasjoner ligger i forskjellige filer.

### 3. Rollebasert tilgang

Studenter kan arbeide med sine egne oppgaver, mens ansatte kan godkjenne og avvise rapporter. Dette kontrolleres i servicelaget.
