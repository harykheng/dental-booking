-- ============================================================================
-- Business logic: validation trigger + RPCs used by the front end
-- ============================================================================

-- ----------------------------------------------------------------------------
-- validate_booking(): defense-in-depth server-side validation, runs on every
-- insert/update to bookings regardless of which path wrote the row
-- (create_booking RPC today, or a direct service_role insert later). Never
-- trusts client-supplied status; always forces 'confirmed'.
-- ----------------------------------------------------------------------------
create or replace function public.validate_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dow            int;
  v_open_time      time := '09:00';
  v_close_time     time := '17:00';
  v_slot_minutes   int  := 30;
  v_last_slot_start time := (v_close_time - (v_slot_minutes || ' minutes')::interval)::time;
begin
  -- v1 has no admin-approval / cancellation flow: every row is 'confirmed'.
  new.status := 'confirmed';

  if not exists (select 1 from public.doctors where id = new.doctor_id and is_active) then
    raise exception 'Selected doctor is not available' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.services where id = new.service_id and is_active) then
    raise exception 'Selected service is not available' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.doctor_services
    where doctor_id = new.doctor_id and service_id = new.service_id
  ) then
    raise exception 'Selected doctor does not offer this service' using errcode = 'P0001';
  end if;

  if new.booking_date < current_date then
    raise exception 'Booking date cannot be in the past' using errcode = 'P0001';
  end if;

  -- Clinic hours: Monday-Saturday, 09:00-17:00 (dow: 0 = Sunday)
  v_dow := extract(dow from new.booking_date);
  if v_dow = 0 then
    raise exception 'Clinic is closed on Sunday' using errcode = 'P0001';
  end if;

  if new.booking_time < v_open_time or new.booking_time > v_last_slot_start then
    raise exception 'Booking time is outside clinic hours (09:00-17:00)' using errcode = 'P0001';
  end if;

  if extract(minute from new.booking_time)::int % v_slot_minutes <> 0
     or extract(second from new.booking_time)::int <> 0 then
    raise exception 'Booking time must align to 30-minute slots' using errcode = 'P0001';
  end if;

  if new.booking_date = current_date and new.booking_time <= current_time then
    raise exception 'Booking time has already passed' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_booking on public.bookings;
create trigger trg_validate_booking
  before insert or update on public.bookings
  for each row execute function public.validate_booking();

-- ----------------------------------------------------------------------------
-- get_available_slots(doctor, service, date)
-- Returns the full 09:00-17:00 grid (30-min steps) with an is_available flag,
-- so the front end can render taken/past slots as disabled rather than just
-- omitting them. Does not expose any patient PII (only times).
-- ----------------------------------------------------------------------------
create or replace function public.get_available_slots(
  p_doctor_id  uuid,
  p_service_id uuid,
  p_date       date
)
returns table (slot_time time, is_available boolean)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  -- Unknown/inactive doctor, service, or a combination the doctor doesn't
  -- offer -> no slots at all (front end should treat empty result as
  -- "invalid selection", distinct from "date fully booked").
  if not exists (
    select 1
    from public.doctor_services ds
    join public.doctors d on d.id = ds.doctor_id and d.is_active
    join public.services s on s.id = ds.service_id and s.is_active
    where ds.doctor_id = p_doctor_id and ds.service_id = p_service_id
  ) then
    return;
  end if;

  -- Clinic closed Sundays -> no slots.
  if extract(dow from p_date) = 0 then
    return;
  end if;

  return query
  select
    grid.slot_time,
    (
      not exists (
        select 1 from public.bookings b
        where b.doctor_id = p_doctor_id
          and b.booking_date = p_date
          and b.booking_time = grid.slot_time
          and b.status = 'confirmed'
      )
      and (p_date > current_date or (p_date = current_date and grid.slot_time > current_time))
    ) as is_available
  from (
    select generate_series(
      '2000-01-01 09:00'::timestamp,
      '2000-01-01 16:30'::timestamp,
      interval '30 minutes'
    )::time as slot_time
  ) as grid
  order by grid.slot_time;
end;
$$;

grant execute on function public.get_available_slots(uuid, uuid, date) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- create_booking(...)
-- The ONLY way to create a booking. SECURITY DEFINER so it can insert into
-- the otherwise-locked-down bookings table and read back doctor/service
-- names for the confirmation payload, without granting anon any direct
-- table privileges. All business-rule validation happens in
-- validate_booking() (trigger) plus the column CHECK constraints on
-- bookings, so client-supplied values are never trusted as-is.
-- Concurrency: relies on bookings_doctor_slot_unique_idx; a race between two
-- guests booking the same slot resolves as one success + one clean error.
-- ----------------------------------------------------------------------------
create or replace function public.create_booking(
  p_doctor_id     uuid,
  p_service_id    uuid,
  p_patient_name  text,
  p_patient_phone text,
  p_patient_email text,
  p_booking_date  date,
  p_booking_time  time
)
returns table (
  id            uuid,
  doctor_id     uuid,
  doctor_name   text,
  service_id    uuid,
  service_name  text,
  patient_name  text,
  patient_phone text,
  patient_email text,
  booking_date  date,
  booking_time  time,
  status        text,
  created_at    timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
begin
  if p_doctor_id is null or p_service_id is null or p_booking_date is null or p_booking_time is null then
    raise exception 'doctor, service, date and time are required' using errcode = 'P0001';
  end if;

  if p_patient_name is null or btrim(p_patient_name) = '' then
    raise exception 'patient name is required' using errcode = 'P0001';
  end if;

  insert into public.bookings (
    doctor_id, service_id, patient_name, patient_phone, patient_email,
    booking_date, booking_time
  )
  values (
    p_doctor_id, p_service_id,
    btrim(p_patient_name),
    btrim(p_patient_phone),
    lower(btrim(p_patient_email)),
    p_booking_date, p_booking_time
  )
  returning * into v_booking;

  return query
  select
    v_booking.id,
    v_booking.doctor_id,
    d.name,
    v_booking.service_id,
    s.name,
    v_booking.patient_name,
    v_booking.patient_phone,
    v_booking.patient_email,
    v_booking.booking_date,
    v_booking.booking_time,
    v_booking.status,
    v_booking.created_at
  from public.doctors d, public.services s
  where d.id = v_booking.doctor_id and s.id = v_booking.service_id;

exception
  when unique_violation then
    raise exception 'This time slot was just taken by another patient. Please choose a different slot.'
      using errcode = '23505';
  when check_violation then
    -- Re-raise without Postgres's default DETAIL (which echoes the
    -- offending row's column values back to the client) — surface a clean,
    -- displayable message instead.
    raise exception 'Please check your name, phone number and email format and try again.'
      using errcode = '23514';
end;
$$;

grant execute on function public.create_booking(uuid, uuid, text, text, text, date, time) to anon, authenticated;
