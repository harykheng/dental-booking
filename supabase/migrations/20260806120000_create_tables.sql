-- ============================================================================
-- Dental Booking v1 — core schema
-- Tables: services, doctors, doctor_services (junction), bookings
-- ============================================================================

create extension if not exists pgcrypto; -- provides gen_random_uuid()

-- ----------------------------------------------------------------------------
-- services: catalog of treatments offered by the clinic
-- ----------------------------------------------------------------------------
create table public.services (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  price       numeric(12, 2) not null check (price >= 0),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

comment on table public.services is 'Catalog of dental treatments. Public read-only for active rows; managed via Supabase dashboard/service role.';

-- ----------------------------------------------------------------------------
-- doctors
-- ----------------------------------------------------------------------------
create table public.doctors (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  specialization text,
  photo_url      text,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

comment on table public.doctors is 'Clinic doctors. Public read-only for active rows; managed via Supabase dashboard/service role.';

-- ----------------------------------------------------------------------------
-- doctor_services: many-to-many, which doctor performs which service
-- ----------------------------------------------------------------------------
create table public.doctor_services (
  doctor_id  uuid not null references public.doctors(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (doctor_id, service_id)
);

create index doctor_services_service_id_idx on public.doctor_services (service_id);

comment on table public.doctor_services is 'Which services each doctor can perform. Public read-only.';

-- ----------------------------------------------------------------------------
-- bookings: guest patient bookings (no login/account in v1)
-- ----------------------------------------------------------------------------
create table public.bookings (
  id           uuid primary key default gen_random_uuid(),
  doctor_id    uuid not null references public.doctors(id),
  service_id   uuid not null references public.services(id),

  patient_name  text not null check (char_length(btrim(patient_name)) between 1 and 150),
  patient_phone text not null check (patient_phone ~ '^[0-9+\s()-]{6,20}$'),
  patient_email text not null check (patient_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),

  booking_date date not null,
  booking_time time not null,

  -- v1 has no admin approval flow and no cancel/reschedule: every row is
  -- created as 'confirmed'. The column (and 'confirmed'-scoped constraints
  -- below) exist so a future status (e.g. 'cancelled') can be added without
  -- a breaking migration.
  status text not null default 'confirmed' check (status in ('confirmed')),

  -- guards the confirmation-email webhook against duplicate sends on
  -- redelivery (see supabase/functions/send-booking-confirmation)
  confirmation_email_sent boolean not null default false,

  created_at timestamptz not null default now()
);

comment on table public.bookings is 'Guest patient bookings. No login/account, no payment field (pay-on-site), no cancel/reschedule in v1.';

-- ----------------------------------------------------------------------------
-- Anti double-booking guarantee (DB-level, not just app-level validation).
-- A partial unique index means two 'confirmed' bookings can never share the
-- same doctor + date + time. Concurrent inserts for the same slot: the
-- second one fails with a unique_violation instead of silently overwriting
-- or duplicating the slot.
-- ----------------------------------------------------------------------------
create unique index bookings_doctor_slot_unique_idx
  on public.bookings (doctor_id, booking_date, booking_time)
  where status = 'confirmed';

create index bookings_date_idx on public.bookings (booking_date);
create index bookings_doctor_id_idx on public.bookings (doctor_id);
