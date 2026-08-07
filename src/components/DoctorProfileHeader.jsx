import { useState } from 'react'
import { getDummyPhotoUrl } from '../utils/dummyDoctorStats'

// Large photo header for the doctor profile page: full-width photo with a
// floating back button (browser history back, falls back to Home) and a
// floating overflow (⋮) button. The overflow button is a UI placeholder
// only — mirrors the notification bell on Home (no onClick/dropdown).
export default function DoctorProfileHeader({ doctor, onBack }) {
  const [imgFailed, setImgFailed] = useState(false)
  const photoSrc = doctor.photo_url || getDummyPhotoUrl(doctor.id)
  const showPhoto = !imgFailed

  return (
    <div className="relative h-64 w-full min-w-0 shrink-0 overflow-hidden bg-blue-100 sm:h-72">
      {showPhoto ? (
        <img
          src={photoSrc}
          alt={`Foto dokter ${doctor.name}`}
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-blue-100 text-6xl font-semibold text-blue-700">
          {doctor.name?.charAt(0).toUpperCase() ?? '?'}
        </div>
      )}

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-lg text-white backdrop-blur-sm transition hover:bg-black/40"
        >
          <span aria-hidden="true">&#8592;</span>
        </button>
        <button
          type="button"
          aria-label="Menu lainnya"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-lg text-white backdrop-blur-sm transition hover:bg-black/40"
        >
          <span aria-hidden="true">&#8942;</span>
        </button>
      </div>
    </div>
  )
}
