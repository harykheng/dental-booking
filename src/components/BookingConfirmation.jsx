import { formatDateLong, formatTime } from '../utils/format'

export default function BookingConfirmation({ booking, onBookAnother }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-teal-200 bg-white p-6 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-2xl text-teal-600">
        ✓
      </div>
      <h2 className="mt-3 text-lg font-semibold text-slate-900">
        Booking Berhasil!
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Terima kasih, {booking.patient_name}. Jadwal Anda sudah dikonfirmasi.
      </p>

      <dl className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4 text-left text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Layanan</dt>
          <dd className="font-medium text-slate-900">{booking.service_name}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Dokter</dt>
          <dd className="font-medium text-slate-900">{booking.doctor_name}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Tanggal</dt>
          <dd className="font-medium text-slate-900">
            {formatDateLong(booking.booking_date)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Jam</dt>
          <dd className="font-medium text-slate-900">
            {formatTime(booking.booking_time)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Status</dt>
          <dd className="font-medium capitalize text-teal-700">
            {booking.status}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-slate-500">
        Konfirmasi kirim ke {booking.patient_email} / {booking.patient_phone}.
        Pembayaran dilakukan langsung di klinik.
      </p>

      <button
        type="button"
        onClick={onBookAnother}
        className="mt-5 w-full rounded-lg border border-teal-600 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50"
      >
        Buat Booking Lain
      </button>
    </div>
  )
}
