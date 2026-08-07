import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBookingFlow } from '../context/BookingFlowContext'
import ServiceSelector from '../components/ServiceSelector'
import DateTimeSelector from '../components/DateTimeSelector'
import DoctorProfileHeader from '../components/DoctorProfileHeader'
import DoctorStatsRow from '../components/DoctorStatsRow'
import Spinner from '../components/ui/Spinner'
import ErrorNotice from '../components/ui/ErrorNotice'
import EmptyNotice from '../components/ui/EmptyNotice'

export default function DoctorProfilePage() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const {
    services,
    doctors,
    doctorServices,
    catalogLoading,
    catalogError,
    reloadCatalog,
    selectedDoctorId,
    selectedServiceId,
    setDoctorFromRoute,
    chooseServiceForDoctor,
    selectedDate,
    handleSelectDate,
    slots,
    slotsLoading,
    slotsError,
    reloadSlots,
    selectedTime,
    setSelectedTime,
    submitError,
  } = useBookingFlow()

  // If this doctor's profile was opened directly (fresh page load, shared
  // link, or navigating between doctors) without matching context state,
  // start a clean flow for this doctor.
  useEffect(() => {
    if (doctorId && doctorId !== selectedDoctorId) {
      setDoctorFromRoute(doctorId)
    }
  }, [doctorId, selectedDoctorId, setDoctorFromRoute])

  const doctor = useMemo(
    () => doctors.find((item) => item.id === doctorId),
    [doctors, doctorId]
  )

  const eligibleServices = useMemo(() => {
    const serviceIds = new Set(
      doctorServices
        .filter((row) => row.doctor_id === doctorId)
        .map((row) => row.service_id)
    )
    return services.filter((service) => serviceIds.has(service.id))
  }, [services, doctorServices, doctorId])

  const isServiceEligible =
    !!selectedServiceId &&
    eligibleServices.some((service) => service.id === selectedServiceId)

  const canBook = isServiceEligible && !!selectedDate && !!selectedTime

  function handleBook() {
    if (!canBook) return
    navigate('/book/confirm')
  }

  function handleBack() {
    // Prefer real browser history back; fall back to Home when this page
    // was opened directly (fresh load / shared link) with no prior entry.
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  if (catalogLoading || doctorId !== selectedDoctorId) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <Spinner label="Memuat profil dokter..." />
      </div>
    )
  }

  if (catalogError) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <ErrorNotice message={catalogError} onRetry={reloadCatalog} />
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <EmptyNotice message="Dokter tidak ditemukan. Silakan kembali ke halaman utama." />
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 w-full rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
        >
          Kembali ke Home
        </button>
      </div>
    )
  }

  return (
    <div className="min-w-0 pb-40">
      <DoctorProfileHeader doctor={doctor} onBack={handleBack} />

      <div className="mx-auto -mt-6 min-w-0 max-w-md">
        <section className="min-w-0 rounded-t-3xl bg-white px-4 pt-5 pb-2">
          <h1 className="truncate text-xl font-bold text-slate-900">
            {doctor.name}
          </h1>
          {doctor.specialization && (
            <p className="truncate text-sm text-slate-500">
              {doctor.specialization}
            </p>
          )}

          <DoctorStatsRow />
        </section>

        <div className="mt-4 grid min-w-0 gap-4 px-4">
          {!isServiceEligible && (
            <ServiceSelector
              services={eligibleServices}
              loading={false}
              error={null}
              onRetry={reloadCatalog}
              selectedServiceId={selectedServiceId}
              onSelect={chooseServiceForDoctor}
            />
          )}

          {isServiceEligible && (
            <DateTimeSelector
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              slots={slots}
              slotsLoading={slotsLoading}
              slotsError={slotsError}
              onRetrySlots={reloadSlots}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
            />
          )}

          {submitError && <ErrorNotice message={submitError} />}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-14 border-t border-slate-200 bg-white p-4">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            disabled={!canBook}
            onClick={handleBook}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  )
}
