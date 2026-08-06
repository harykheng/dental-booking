import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookingFlow } from '../context/BookingFlowContext'
import CategoryFilterTabs from '../components/CategoryFilterTabs'
import DoctorCard from '../components/DoctorCard'
import Spinner from '../components/ui/Spinner'
import ErrorNotice from '../components/ui/ErrorNotice'
import EmptyNotice from '../components/ui/EmptyNotice'

export default function HomePage() {
  const navigate = useNavigate()
  const {
    services,
    doctors,
    doctorServices,
    catalogLoading,
    catalogError,
    reloadCatalog,
    startBookingWithDoctor,
  } = useBookingFlow()

  const [activeCategory, setActiveCategory] = useState(null)

  const visibleDoctors = useMemo(() => {
    if (!activeCategory) return doctors
    const doctorIds = new Set(
      doctorServices
        .filter((row) => row.service_id === activeCategory)
        .map((row) => row.doctor_id)
    )
    return doctors.filter((doctor) => doctorIds.has(doctor.id))
  }, [doctors, doctorServices, activeCategory])

  function handleSelectDoctor(doctor) {
    startBookingWithDoctor(doctor.id, activeCategory)
    navigate(`/doctor/${doctor.id}`)
  }

  return (
    <div className="mx-auto min-w-0 max-w-md px-4 py-6 pb-24">
      <header className="mb-5">
        <p className="text-sm font-medium text-blue-600">Selamat Datang</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Buat Janji Temu
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Pilih layanan dan dokter gigi pilihan Anda.
        </p>
      </header>

      {catalogLoading && <Spinner label="Memuat data klinik..." />}

      {!catalogLoading && catalogError && (
        <ErrorNotice message={catalogError} onRetry={reloadCatalog} />
      )}

      {!catalogLoading && !catalogError && (
        <div className="grid min-w-0 gap-4">
          <CategoryFilterTabs
            services={services}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />

          <div className="min-w-0">
            <h2 className="mb-2 text-base font-semibold text-slate-900">
              Dokter Tersedia
            </h2>

            {visibleDoctors.length === 0 && (
              <EmptyNotice message="Belum ada dokter untuk kategori ini. Silakan pilih kategori lain." />
            )}

            {visibleDoctors.length > 0 && (
              <div className="grid min-w-0 gap-3">
                {visibleDoctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    onClick={() => handleSelectDoctor(doctor)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
