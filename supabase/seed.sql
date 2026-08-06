-- ============================================================================
-- Dummy/seed data for local development and front-end testing.
-- Runs automatically on `supabase db reset` / `supabase start`.
-- Replace or edit via the Supabase dashboard once real clinic data is ready.
-- ============================================================================

insert into public.services (id, name, description, price, is_active) values
  ('a1000000-0000-4000-8000-000000000001', 'Konsultasi Gigi', 'Pemeriksaan dan konsultasi awal kondisi gigi & mulut.', 100000, true),
  ('a1000000-0000-4000-8000-000000000002', 'Scaling (Pembersihan Karang Gigi)', 'Pembersihan plak dan karang gigi menyeluruh.', 250000, true),
  ('a1000000-0000-4000-8000-000000000003', 'Tambal Gigi', 'Penambalan gigi berlubang dengan bahan komposit.', 200000, true),
  ('a1000000-0000-4000-8000-000000000004', 'Cabut Gigi', 'Pencabutan gigi permanen atau sulung.', 300000, true);

insert into public.doctors (id, name, specialization, is_active) values
  ('b1000000-0000-4000-8000-000000000001', 'drg. Dewi Anggraini', 'Dokter Gigi Umum', true),
  ('b1000000-0000-4000-8000-000000000002', 'drg. Bagus Prasetyo, Sp.KG', 'Spesialis Konservasi Gigi', true),
  ('b1000000-0000-4000-8000-000000000003', 'drg. Nadia Putri', 'Dokter Gigi Umum', true);

-- drg. Dewi Anggraini (umum) -> semua layanan
insert into public.doctor_services (doctor_id, service_id) values
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000004');

-- drg. Bagus Prasetyo (spesialis konservasi gigi) -> konsultasi + tambal
insert into public.doctor_services (doctor_id, service_id) values
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000003');

-- drg. Nadia Putri (umum) -> semua layanan
insert into public.doctor_services (doctor_id, service_id) values
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000004');
