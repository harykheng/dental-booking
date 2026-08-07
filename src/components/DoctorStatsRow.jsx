import {
  DUMMY_PATIENT_COUNT,
  DUMMY_EXPERIENCE_YEARS,
  DUMMY_REVIEW_COUNT,
} from '../utils/dummyDoctorStats'

// Row of 3 dummy stat boxes shown under the doctor's name. Values are the
// SAME placeholder constants used by DoctorCard.jsx on Home, so a given
// doctor shows consistent numbers everywhere — see utils/dummyDoctorStats.js.
export default function DoctorStatsRow() {
  const stats = [
    { label: 'Pasien', value: DUMMY_PATIENT_COUNT },
    { label: 'Pengalaman', value: `${DUMMY_EXPERIENCE_YEARS}+ Tahun` },
    { label: 'Ulasan', value: `${DUMMY_REVIEW_COUNT}+` },
  ]

  return (
    <div className="mt-4 grid min-w-0 grid-cols-3 gap-2">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="min-w-0 rounded-xl bg-slate-100 px-2 py-3 text-center"
        >
          <p className="truncate text-sm font-bold text-slate-900">
            {stat.value}
          </p>
          <p className="truncate text-[11px] text-slate-500">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
