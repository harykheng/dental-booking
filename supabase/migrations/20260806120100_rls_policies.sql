-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.services enable row level security;
alter table public.doctors enable row level security;
alter table public.doctor_services enable row level security;
alter table public.bookings enable row level security;

-- ----------------------------------------------------------------------------
-- services / doctors: public catalog data needed to render the booking form.
-- Read-only for anon + authenticated. Only active rows are exposed so the
-- clinic can "retire" a doctor/service from the dashboard without deleting
-- history. No insert/update/delete policy -> only service_role (dashboard,
-- migrations) can write.
-- ----------------------------------------------------------------------------
create policy "Public can read active services"
  on public.services
  for select
  to anon, authenticated
  using (is_active = true);

create policy "Public can read active doctors"
  on public.doctors
  for select
  to anon, authenticated
  using (is_active = true);

create policy "Public can read active doctor_services"
  on public.doctor_services
  for select
  to anon, authenticated
  using (
    exists (select 1 from public.doctors d where d.id = doctor_id and d.is_active)
    and exists (select 1 from public.services s where s.id = service_id and s.is_active)
  );

-- ----------------------------------------------------------------------------
-- bookings: intentionally has NO policies for anon/authenticated.
--
-- Rationale: guests have no session/identity to scope a "read your own
-- booking" policy to, and bookings contain patient PII (name, phone,
-- email). Opening SELECT to "anyone" would leak every patient's contact
-- info; opening it to "rows you just inserted" is not reliably expressible
-- without an auth session. Instead, all access goes through the
-- SECURITY DEFINER RPCs below (create_booking, get_available_slots), which
-- validate input server-side and only ever return the caller's own new
-- booking or non-PII slot availability. service_role (used by the Edge
-- Function / dashboard) bypasses RLS as usual.
-- ----------------------------------------------------------------------------
