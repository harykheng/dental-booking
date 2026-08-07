// Functional search input for HomePage: filters the doctor list below by
// doctor name or by name of any service that doctor offers (case
// insensitive, partial match). Rendered as a white card that overlaps the
// blue header above it.
export default function HomeSearchBar({ value, onChange }) {
  return (
    <div className="mx-auto -mt-8 min-w-0 max-w-md px-4">
      <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-md">
        <span className="shrink-0 text-slate-400" aria-hidden="true">
          &#128269;
        </span>
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Cari dokter atau layanan..."
          aria-label="Cari dokter atau layanan"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>
    </div>
  )
}
