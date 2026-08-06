import EmptyNotice from './ui/EmptyNotice'

export default function DoctorSelector({ doctors, selectedDoctorId, onSelect }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">2. Pilih Dokter</h2>

      {doctors.length === 0 && (
        <div className="mt-3">
          <EmptyNotice message="Belum ada dokter yang melayani layanan ini. Silakan pilih layanan lain atau hubungi klinik langsung." />
        </div>
      )}

      {doctors.length > 0 && (
        <div className="mt-3 grid gap-2">
          {doctors.map((doctor) => {
            const isSelected = doctor.id === selectedDoctorId
            return (
              <button
                key={doctor.id}
                type="button"
                onClick={() => onSelect(doctor.id)}
                className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                    : 'border-slate-200 hover:border-teal-300'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
                  {doctor.name?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {doctor.name}
                  </p>
                  {doctor.specialization && (
                    <p className="text-xs text-slate-500">
                      {doctor.specialization}
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
