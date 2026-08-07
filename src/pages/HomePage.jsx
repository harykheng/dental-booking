import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookingFlow } from '../context/BookingFlowContext'
import HomeHeader from '../components/HomeHeader'
import HomeSearchBar from '../components/HomeSearchBar'
import CategoryIconGrid from '../components/CategoryIconGrid'
import FeaturedComplaintCard from '../components/FeaturedComplaintCard'
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
  const [searchQuery, setSearchQuery] = useState('')
  const doctorListRef = useRef(null)

  const serviceNamesByDoctorId = useMemo(() => {
    const serviceNameById = new Map(services.map((s) => [s.id, s.name]))
    const map = new Map()
    doctorServices.forEach((row) => {
      const name = serviceNameById.get(row.service_id)
      if (!name) return
      const list = map.get(row.doctor_id) ?? []
      list.push(name)
      map.set(row.doctor_id, list)
    })
    return map
  }, [services, doctorServices])

  const categoryFilteredDoctors = useMemo(() => {
    if (!activeCategory) return doctors
    const doctorIds = new Set(
      doctorServices
        .filter((row) => row.service_id === activeCategory)
        .map((row) => row.doctor_id)
    )
    return doctors.filter((doctor) => doctorIds.has(doctor.id))
  }, [doctors, doctorServices, activeCategory])

  const trimmedQuery = searchQuery.trim().toLowerCase()

  const visibleDoctors = useMemo(() => {
    if (!trimmedQuery) return categoryFilteredDoctors
    return categoryFilteredDoctors.filter((doctor) => {
      const nameMatch = doctor.name?.toLowerCase().includes(trimmedQuery)
      const serviceMatch = (serviceNamesByDoctorId.get(doctor.id) ?? []).some(
        (serviceName) => serviceName.toLowerCase().includes(trimmedQuery)
      )
      return nameMatch || serviceMatch
    })
  }, [categoryFilteredDoctors, trimmedQuery, serviceNamesByDoctorId])

  function handleSelectDoctor(doctor) {
    startBookingWithDoctor(doctor.id, activeCategory)
    navigate(`/doctor/${doctor.id}`)
  }

  function scrollToDoctorList() {
    doctorListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-w-0 pb-24">
      <HomeHeader />
      <HomeSearchBar value={searchQuery} onChange={setSearchQuery} />

      <div className="mx-auto mt-6 min-w-0 max-w-md px-4">
        {catalogLoading && <Spinner label="Memuat data klinik..." />}

        {!catalogLoading && catalogError && (
          <ErrorNotice message={catalogError} onRetry={reloadCatalog} />
        )}

        {!catalogLoading && !catalogError && (
          <div className="grid min-w-0 gap-6">
            <CategoryIconGrid
              services={services}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />

            <FeaturedComplaintCard onBookingClick={scrollToDoctorList} />

            <div ref={doctorListRef} className="min-w-0 scroll-mt-4">
              <h2 className="mb-2 text-base font-semibold text-slate-900">
                Dokter Tersedia
              </h2>

              {visibleDoctors.length === 0 && trimmedQuery && (
                <EmptyNotice message="Tidak ditemukan dokter/layanan yang cocok." />
              )}

              {visibleDoctors.length === 0 && !trimmedQuery && (
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
    </div>
  )
}
