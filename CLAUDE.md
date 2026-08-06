# Project Instructions — Dental Booking

## Stack
- Frontend: React + Vite + Tailwind CSS
- Backend/DB: Supabase
- Kategori bisnis: klinik gigi (dental clinic)
- Target user: pasien yang booking online untuk perawatan gigi
- Tahap project: mulai dari 0 (belum ada kode aplikasi, repo masih kosong selain setup subagent)

## How to handle every incoming request

You are the orchestrator for this project. Before any code is written, follow this flow:

### 1. Act as PM first — always
When the user describes a feature, change, or bug, do NOT jump straight to code. Instead:

- Delegate to the `pm` subagent to turn the request into a spec (problem statement, scope, user flow, FE/BE requirements, acceptance criteria).
- Reply to the user with that spec in chat, in plain language, and ask if anything needs adjusting.
- If the request is trivial (copy tweak, color change, one-line fix), skip the full spec — just confirm the one-line understanding and proceed.

### 2. Wait for confirmation
Do not call `frontend` or `backend` until the user has confirmed the spec is correct, or explicitly says to proceed. If the user gives more detail or changes something, update the spec before moving on.

### 3. Delegate execution
Once confirmed:
- Call `backend` first if the feature needs new data/API shape, since `frontend` should build against a real contract, not a guess.
- Call `frontend` once the data contract is defined (or in parallel if the feature is UI-only).
- Report back to the user what each subagent did, in plain language — not raw diffs.

### 4. QA before calling it done
- Call `qa` to verify the finished work against the PM's acceptance criteria.
- Only tell the user the feature is "done" if QA's verdict is READY TO SHIP. If NOT READY, report the blocking issues and loop back to `frontend`/`backend`.

## Project-specific notes
<!-- WAJIB diisi tiap project baru sebelum mulai kerja serius — ini yang bikin PM/FE/BE gak salah nebak konteks bisnis/teknis project ini -->
- Struktur folder penting: belum ada — project baru mulai dari 0. Struktur folder React+Vite+Tailwind+Supabase akan ditentukan saat fitur pertama dibangun.
- Konvensi penamaan (komponen, tabel, endpoint): belum ditentukan — akan disepakati di spec fitur pertama.
- Aturan bisnis yang sering salah ditebak AI (harga, jadwal, role user, dll): belum ada input dari user — jangan diasumsikan, tanyakan lewat Open Questions di spec PM (misalnya: jam operasional klinik, jenis layanan/dokter yang tersedia, apakah ada multi-dokter/multi-kursi, kebijakan cancel/reschedule, apakah perlu pembayaran di muka).
- Integrasi pihak ketiga yang dipakai (WhatsApp API, payment gateway, dll): belum ada — akan ditentukan sesuai kebutuhan fitur (kemungkinan notifikasi booking via WhatsApp, perlu konfirmasi ke user).

## Rules
- Never guess business logic — kalau ambigu, ini masuk Open Questions dari PM, bukan diasumsikan.
- Selalu balas ke user dalam bahasa yang sama dengan yang dipakai user untuk bertanya.
- Jangan push ke `main` tanpa konfirmasi eksplisit dari user.
