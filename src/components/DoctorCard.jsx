import { useState } from 'react'
import {
  DUMMY_RATING,
  DUMMY_REVIEW_COUNT,
  DUMMY_EXPERIENCE_YEARS,
  DUMMY_AVAILABLE_HOURS,
  getDummyPhotoUrl,
} from '../utils/dummyDoctorStats'

// Doctor card for the Home list.
//
// Rating, years-of-experience, and available-hours are DUMMY/placeholder
// values shared with DoctorProfilePage — see utils/dummyDoctorStats.js.

export default function DoctorCard({ doctor, onClick }) {
  const [imgFailed, setImgFailed] = useState(false)
  const photoSrc = doctor.photo_url || getDummyPhotoUrl(doctor.id)
  const showPhoto = !imgFailed

  return (
    <div className="flex min-w-0 items-stretch gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-300 hover:shadow-md">
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">
            {doctor.name}
          </p>
          {doctor.specialization && (
            <p className="truncate text-xs text-slate-500">
              {doctor.specialization}
            </p>
          )}

          <div className="mt-2 grid gap-1 text-xs text-slate-600">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="shrink-0 text-amber-400" aria-hidden="true">
                &#9733;
              </span>
              <span className="truncate">
                {DUMMY_RATING} ({DUMMY_REVIEW_COUNT} ulasan)
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="shrink-0 text-blue-500" aria-hidden="true">
                &#127891;
              </span>
              <span className="truncate">
                {DUMMY_EXPERIENCE_YEARS} tahun pengalaman
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="shrink-0 text-blue-500" aria-hidden="true">
                &#128337;
              </span>
              <span className="truncate">{DUMMY_AVAILABLE_HOURS}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClick}
          className="mt-3 w-full rounded-full bg-blue-600 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
        >
          Booking
        </button>
      </div>

      <div className="w-24 shrink-0 sm:w-28">
        {showPhoto ? (
          <img
            src={photoSrc}
            alt={`Foto dokter ${doctor.name}`}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-blue-100 text-2xl font-semibold text-blue-700">
            {doctor.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
        )}
      </div>
    </div>
  )
}
