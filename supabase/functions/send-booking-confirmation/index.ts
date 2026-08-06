// ============================================================================
// send-booking-confirmation
//
// Trigger: this function is meant to be invoked by a Supabase Database
// Webhook configured on `public.bookings` for the INSERT event
// (Dashboard -> Database -> Webhooks -> Create a new hook -> HTTP Request
// pointing at this function's URL). Supabase Webhooks deliver a payload
// shaped like:
//   { type: "INSERT", table: "bookings", record: {...new row...}, schema: "public", old_record: null }
//
// Idempotency: Database Webhooks (and any HTTP call) can be redelivered.
// Before sending an email we atomically "claim" the booking by flipping
// bookings.confirmation_email_sent from false -> true with a conditional
// UPDATE. If zero rows are affected, another delivery already claimed it
// (or is claiming it), so we exit without sending a duplicate email.
//
// ---------------------------------------------------------------------------
// MANUAL SETUP REQUIRED (user must do this — do not hardcode secrets):
//   1. Deploy this function:  supabase functions deploy send-booking-confirmation
//   2. Set secrets:
//        supabase secrets set RESEND_API_KEY=your_resend_api_key
//        supabase secrets set BOOKING_FROM_EMAIL="Klinik Gigi <no-reply@yourdomain.com>"
//      (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically
//      by the Supabase Edge Runtime — do not set them manually.)
//   3. Create the Database Webhook in the dashboard: table `bookings`,
//      event `INSERT`, target = this function's URL, with the
//      `apikey`/`Authorization` header set to your project's service role
//      key (webhooks call the function as an HTTP request, so it needs its
//      own auth header — see Supabase docs: Database Webhooks).
//   4. TODO(user): swap the Resend integration below for whichever email
//      provider you prefer if not Resend — the "claim" logic above should
//      stay the same regardless of provider.
// ============================================================================

// deno-lint-ignore-file no-explicit-any

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY"); // TODO(user): set via `supabase secrets set`
const FROM_EMAIL = Deno.env.get("BOOKING_FROM_EMAIL") ?? "Klinik Gigi <no-reply@example.com>"; // TODO(user): verify a real sending domain with your provider

interface BookingRecord {
  id: string;
  doctor_id: string;
  service_id: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  booking_date: string;
  booking_time: string;
  status: string;
}

interface WebhookPayload {
  type: string;
  table: string;
  record: BookingRecord;
  schema: string;
  old_record: BookingRecord | null;
}

function restHeaders() {
  return {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };
}

// Atomically claims the "send confirmation email" job for this booking.
// Returns true if this invocation should proceed to send the email.
async function claimBookingForEmail(bookingId: string): Promise<boolean> {
  const url =
    `${SUPABASE_URL}/rest/v1/bookings?id=eq.${bookingId}&confirmation_email_sent=eq.false`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: { ...restHeaders(), Prefer: "return=representation" },
    body: JSON.stringify({ confirmation_email_sent: true }),
  });

  if (!res.ok) {
    console.error("Failed to claim booking for email", await res.text());
    return false;
  }

  const rows = await res.json();
  return Array.isArray(rows) && rows.length === 1;
}

async function fetchName(table: "doctors" | "services", id: string): Promise<string> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}&select=name`;
  const res = await fetch(url, { headers: restHeaders() });
  if (!res.ok) return "";
  const rows = await res.json();
  return rows?.[0]?.name ?? "";
}

async function sendConfirmationEmail(booking: BookingRecord, doctorName: string, serviceName: string) {
  if (!RESEND_API_KEY) {
    // TODO(user): this is a placeholder guard — without an API key we log
    // instead of throwing, so booking creation is never blocked by email
    // configuration. Set RESEND_API_KEY as a Supabase secret to enable
    // actual sending.
    console.warn(
      "RESEND_API_KEY is not set — skipping confirmation email for booking",
      booking.id,
    );
    return;
  }

  const html = `
    <p>Halo ${booking.patient_name},</p>
    <p>Booking Anda telah dikonfirmasi:</p>
    <ul>
      <li>Layanan: ${serviceName}</li>
      <li>Dokter: ${doctorName}</li>
      <li>Tanggal: ${booking.booking_date}</li>
      <li>Jam: ${booking.booking_time}</li>
    </ul>
    <p>Mohon datang 10 menit lebih awal. Sampai jumpa!</p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: booking.patient_email,
      subject: "Konfirmasi Booking - Klinik Gigi",
      html,
    }),
  });

  if (!res.ok) {
    // Do not log booking.patient_email/phone/name in plaintext error dumps
    // beyond what's needed for debugging; avoid logging the provider API key.
    console.error("Failed to send confirmation email", res.status, await res.text());
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (payload.type !== "INSERT" || payload.table !== "bookings") {
    // Not an event we care about; ack so the webhook doesn't retry forever.
    return new Response("Ignored", { status: 200 });
  }

  const booking = payload.record;

  const shouldSend = await claimBookingForEmail(booking.id);
  if (!shouldSend) {
    return new Response(JSON.stringify({ skipped: true, reason: "already handled" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const [doctorName, serviceName] = await Promise.all([
    fetchName("doctors", booking.doctor_id),
    fetchName("services", booking.service_id),
  ]);

  await sendConfirmationEmail(booking, doctorName, serviceName);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
