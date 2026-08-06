# Supabase backend — Dental Booking v1

## Overview

Guest patients (no login) book a **service -> doctor -> date -> time** slot.
Clinic hours: Monday-Saturday, 09:00-17:00, fixed 30-minute slots regardless
of service. Bookings are created as `confirmed` immediately (no admin
approval in v1). No payment fields (pay on-site). No cancel/reschedule in v1.

## Schema

| Table              | Purpose                                                        |
| ------------------ | ---------------------------------------------------------------- |
| `services`          | Treatment catalog (name, description, price, is_active)         |
| `doctors`            | Clinic doctors (name, specialization, is_active)                 |
| `doctor_services`    | Many-to-many: which doctor performs which service                |
| `bookings`           | Guest bookings: patient contact info + doctor/service/date/time  |

Key constraints:

- `bookings_doctor_slot_unique_idx`: **partial unique index** on
  `(doctor_id, booking_date, booking_time) WHERE status = 'confirmed'`.
  This is the actual anti-double-booking guarantee — enforced by Postgres,
  not just application code, so it holds even under concurrent requests.
- `validate_booking()` trigger (BEFORE INSERT/UPDATE on `bookings`): forces
  `status = 'confirmed'`, and rejects rows that reference an inactive
  doctor/service, a doctor that doesn't offer that service, a past
  date/time, a Sunday, or a time not aligned to the 09:00-17:00 / 30-minute
  grid. Runs regardless of which code path inserts, as defense in depth.
- No separate `doctor_availability` table — Mon-Sat 09:00-17:00 is hardcoded
  business logic inside `get_available_slots()` and the validation trigger.
  If the clinic's hours ever need to vary per doctor/day, that's a schema
  change (a real availability table), not a config tweak.

## RLS summary

| Table            | anon/authenticated                                             |
| ---------------- | ---------------------------------------------------------------- |
| `services`        | SELECT only, `is_active = true` rows                             |
| `doctors`          | SELECT only, `is_active = true` rows                             |
| `doctor_services`  | SELECT only, for active doctor+service combos                    |
| `bookings`         | **no policies at all** — see below                                |

`bookings` has RLS enabled with zero policies for `anon`/`authenticated`,
so direct table access (select/insert/update/delete) is denied outright.
The only way to read or write bookings is through the two `SECURITY
DEFINER` RPC functions below, which validate everything server-side and
never return other patients' PII. `service_role` (dashboard, the Edge
Function) bypasses RLS as usual.

## Functions available to the front end (data contract)

Call these via `supabase.rpc(...)`. Both are already `GRANT EXECUTE`'d to
`anon` and `authenticated`.

### `get_available_slots(p_doctor_id uuid, p_service_id uuid, p_date date)`

Returns the full clinic-hours grid for that day with an availability flag,
so the UI can render taken/past slots as disabled instead of just omitting
them.

```ts
const { data, error } = await supabase.rpc('get_available_slots', {
  p_doctor_id: doctorId,
  p_service_id: serviceId,
  p_date: '2026-08-10', // 'YYYY-MM-DD'
});
// data: [{ slot_time: '09:00:00', is_available: true }, { slot_time: '09:30:00', is_available: false }, ...]
```

An empty array means either the doctor/service combo is invalid/inactive,
or the date is a Sunday.

### `create_booking(p_doctor_id, p_service_id, p_patient_name, p_patient_phone, p_patient_email, p_booking_date, p_booking_time)`

Creates the booking (always as `confirmed`) and returns the confirmation
details in one call — nothing further to `select` afterwards, since the
`bookings` table itself isn't directly readable by the client.

```ts
const { data, error } = await supabase.rpc('create_booking', {
  p_doctor_id: doctorId,
  p_service_id: serviceId,
  p_patient_name: 'Budi Santoso',
  p_patient_phone: '081234567890',
  p_patient_email: 'budi@example.com',
  p_booking_date: '2026-08-10',
  p_booking_time: '09:00',
});
// data: [{
//   id, doctor_id, doctor_name, service_id, service_name,
//   patient_name, patient_phone, patient_email,
//   booking_date, booking_time, status, created_at
// }]
```

On failure, `error.message` is a human-readable string suitable for direct
display to the patient (e.g. "This time slot was just taken by another
patient. Please choose a different slot.", "Booking date cannot be in the
past.", "Selected doctor does not offer this service."). The front end
should show `error.message` as-is and, for the double-booking case
specifically, prompt the user to refresh available slots
(`get_available_slots`) and pick again.

### Reading the catalog directly

`services`, `doctors`, and `doctor_services` are plain readable tables (RLS
restricts to active rows), so the front end can just:

```ts
const { data: services } = await supabase.from('services').select('*');
const { data: doctors } = await supabase.from('doctors').select('*');
const { data: doctorServices } = await supabase.from('doctor_services').select('*');
// or join: supabase.from('doctor_services').select('doctor_id, services(*)')
```

## Confirmation email (Edge Function)

`supabase/functions/send-booking-confirmation/index.ts` sends the patient a
confirmation email after a booking is created. It's designed to be invoked
by a **Supabase Database Webhook** on `bookings` INSERT (not called
directly by the front end), and is idempotent against webhook redelivery
via the `bookings.confirmation_email_sent` flag (atomic conditional
UPDATE claims the "send" job before calling the email provider).

It currently integrates with **Resend** as a placeholder; swap the
`sendConfirmationEmail` implementation if you use a different provider.

## What you (the project owner) need to do manually

1. **Create a real Supabase project** (supabase.com) if you haven't yet.
2. **Link this repo and run the migrations**:
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase db push          # applies supabase/migrations/*
   ```
   Or, for local dev: `supabase start` then `supabase db reset` (also runs
   `supabase/seed.sql` automatically).
3. **Front end env vars**: copy `.env.example` to `.env` at the repo root
   and fill in `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from
   Project Settings -> API. Never commit the real `.env`.
4. **Email provider secret** (for the Edge Function):
   ```bash
   supabase functions deploy send-booking-confirmation
   supabase secrets set RESEND_API_KEY=your_resend_api_key
   supabase secrets set BOOKING_FROM_EMAIL="Klinik Gigi <no-reply@yourdomain.com>"
   ```
   Get a Resend API key at resend.com and verify a sending domain (or swap
   in your own provider — see TODOs in the function file).
5. **Create the Database Webhook**: Dashboard -> Database -> Webhooks ->
   new hook on table `bookings`, event `INSERT`, HTTP target = the deployed
   function URL, with an `Authorization: Bearer <service_role_key>` header
   so Supabase's edge runtime accepts the call.
6. **Replace seed data**: `services`, `doctors`, and `doctor_services` are
   currently dummy rows (`supabase/seed.sql`) for local testing — edit or
   replace via the dashboard's Table Editor once real clinic data is ready.
