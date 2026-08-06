// Doctor card for the Home list. Avatar/fallback (photo_url with initial
// fallback) mirrors the pattern used across the app's doctor displays.
export default function DoctorCard({ doctor, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
    >
      {doctor.photo_url ? (
        <img
          src={doctor.photo_url}
          alt={doctor.name}
          className="h-14 w-14 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
          {doctor.name?.charAt(0).toUpperCase() ?? '?'}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {doctor.name}
        </p>
        {doctor.specialization && (
          <p className="truncate text-xs text-slate-500">
            {doctor.specialization}
          </p>
        )}
      </div>

      <span className="shrink-0 text-blue-400" aria-hidden="true">
        &#8250;
      </span>
    </button>
  )
}
