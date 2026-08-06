# Dental Booking

Guest patient booking flow for a dental clinic: pilih layanan → pilih dokter → pilih tanggal & jam → isi data diri → konfirmasi. React + Vite + Tailwind CSS on the front end, Supabase (Postgres + RPC) on the back end.

## Getting started

```bash
npm install
cp .env.example .env
```

Fill in `.env` with your Supabase project's URL and anon key (Project Settings > API):

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
```

Then apply the backend schema (see `supabase/README.md` for full details):

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

Run the dev server:

```bash
npm run dev
```

If `.env` isn't filled in yet, the app still builds and runs, and shows a
friendly "configuration missing" message instead of crashing.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run oxlint
