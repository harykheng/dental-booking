import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBookingFlow } from '../context/BookingFlowContext'
import ServiceSelector from '../components/ServiceSelector'
import DateTimeSelector from '../components/DateTimeSelector'
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
    <div className="mx-auto min-w-0 max-w-md px-4 py-6 pb-40">
      <section className="flex min-w-0 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {doctor.photo_url ? (
          <img
            src={doctor.photo_url}
            alt={doctor.name}
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-semibold text-blue-700">
            {doctor.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-slate-900">
            {doctor.name}
          </h1>
          {doctor.specialization && (
            <p className="truncate text-sm text-slate-500">
              {doctor.specialization}
            </p>
          )}
        </div>
      </section>

      <div className="mt-4 grid min-w-0 gap-4">
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
