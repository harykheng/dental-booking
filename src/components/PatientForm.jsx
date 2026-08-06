export default function PatientForm({ patient, errors, onChange }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">4. Data Diri</h2>

      <div className="mt-3 grid gap-3">
        <div>
          <label htmlFor="patient_name" className="text-xs font-medium text-slate-600">
            Nama Lengkap
          </label>
          <input
            id="patient_name"
            type="text"
            value={patient.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Contoh: Budi Santoso"
            className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-600 ${
              errors.name ? 'border-red-300' : 'border-slate-200 focus:border-teal-600'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="patient_phone" className="text-xs font-medium text-slate-600">
            No. HP (WhatsApp)
          </label>
          <input
            id="patient_phone"
            type="tel"
            inputMode="tel"
            value={patient.phone}
            onChange={(event) => onChange('phone', event.target.value)}
            placeholder="Contoh: 081234567890"
            className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-600 ${
              errors.phone ? 'border-red-300' : 'border-slate-200 focus:border-teal-600'
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
          )}
        </div>

        <div>
          <label htmlFor="patient_email" className="text-xs font-medium text-slate-600">
            Email
          </label>
          <input
            id="patient_email"
            type="email"
            inputMode="email"
            value={patient.email}
            onChange={(event) => onChange('email', event.target.value)}
            placeholder="Contoh: budi@example.com"
            className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-600 ${
              errors.email ? 'border-red-300' : 'border-slate-200 focus:border-teal-600'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
        </div>
      </div>
    </section>
  )
}
