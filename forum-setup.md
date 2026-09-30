# Forum-oppsett

Forumet bruker Supabase for å lagre innlegg slik at de deles mellom besøkende. Supabase har en gratisplan som passer for et lite tekstforum; gratisprosjekter settes på pause etter én uke uten aktivitet.

## Koble til Supabase

1. Opprett et prosjekt på [supabase.com](https://supabase.com/).
2. Åpne prosjektets **SQL Editor**, lim inn innholdet fra `forum-schema.sql`, og kjør SQL-en. Den oppretter innleggstabellen og åpne regler for lesing og publisering. Besøkende kan ikke redigere eller slette innlegg via forumet.
3. Finn prosjektets URL og **publishable key** i prosjektets API-innstillinger. Eldre prosjekter kan vise en `anon`-nøkkel i stedet.
4. Lim verdiene inn i `forum-config.js`:

```js
window.FORUM_CONFIG = {
  url: "https://DITT-PROSJEKT.supabase.co",
  anonKey: "DIN-PUBLISHABLE-ELLER-ANON-KEY"
};
```

Bruk bare publishable/anon-nøkkelen i nettsiden. Ikke legg `service_role`- eller secret-nøkler i filer som publiseres til GitHub. Databasens tilgang styres av reglene i `forum-schema.sql`.

Når konfigurasjonen er lagt inn, commit og push `index.html`, `forum.html`, `forum.js`, `forum-config.js`, `forum-schema.sql` og denne guiden. Forumet dukker opp i menyen når hovedsiden åpnes.

Innleggene er offentlige og kan ikke slettes fra selve forumet. Ved behov kan eieren moderere dem direkte i Supabase-tabellen `forum_posts`.
