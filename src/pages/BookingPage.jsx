import { useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import useCatalog from '../hooks/useCatalog'
import useAvailableSlots from '../hooks/useAvailableSlots'
import { isValidEmail, isValidIndonesianPhone } from '../utils/format'
import ConfigWarning from '../components/ConfigWarning'
import ServiceSelector from '../components/ServiceSelector'
import DoctorSelector from '../components/DoctorSelector'
import DateTimeSelector from '../components/DateTimeSelector'
import PatientForm from '../components/PatientForm'
import BookingConfirmation from '../components/BookingConfirmation'
import ErrorNotice from '../components/ui/ErrorNotice'

const EMPTY_PATIENT = { name: '', phone: '', email: '' }

export default function BookingPage() {
  const { services, doctors, doctorServices, loading, error, reload } =
    useCatalog()

  const [selectedServiceId, setSelectedServiceId] = useState(null)
  const [selectedDoctorId, setSelectedDoctorId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [patient, setPatient] = useState(EMPTY_PATIENT)
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  const eligibleDoctors = useMemo(() => {
    if (!selectedServiceId) return []
    const doctorIds = new Set(
      doctorServices
        .filter((row) => row.service_id === selectedServiceId)
        .map((row) => row.doctor_id)
    )
    return doctors.filter((doctor) => doctorIds.has(doctor.id))
  }, [doctors, doctorServices, selectedServiceId])

  const {
    slots,
    loading: slotsLoading,
    error: slotsError,
    reload: reloadSlots,
  } = useAvailableSlots({
    doctorId: selectedDoctorId,
    serviceId: selectedServiceId,
    date: selectedDate,
  })

  function handleSelectService(serviceId) {
    setSelectedServiceId(serviceId)
    setSelectedDoctorId(null)
    setSelectedDate(null)
    setSelectedTime(null)
  }

  function handleSelectDoctor(doctorId) {
    setSelectedDoctorId(doctorId)
    setSelectedDate(null)
    setSelectedTime(null)
  }

  function handleSelectDate(date) {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  function handlePatientChange(field, value) {
    setPatient((prev) => ({ ...prev, [field]: value }))
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const fieldErrors = useMemo(() => {
    const errors = {}
    if (touched.name && patient.name.trim().length < 2) {
      errors.name = 'Nama lengkap wajib diisi (minimal 2 karakter).'
    }
    if (touched.phone && !isValidIndonesianPhone(patient.phone)) {
      errors.phone = 'Nomor HP tidak valid. Contoh: 081234567890.'
    }
    if (touched.email && !isValidEmail(patient.email)) {
      errors.email = 'Format email tidak valid.'
    }
    return errors
  }, [patient, touched])

  const isPatientInfoValid =
    patient.name.trim().length >= 2 &&
    isValidIndonesianPhone(patient.phone) &&
    isValidEmail(patient.email)

  const canSubmit =
    isSupabaseConfigured &&
    selectedServiceId &&
    selectedDoctorId &&
    selectedDate &&
    selectedTime &&
    isPatientInfoValid &&
    !submitting

  async function handleSubmit(event) {
    event.preventDefault()
    setTouched({ name: true, phone: true, email: true })
    if (!canSubmit) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const { data, error: rpcError } = await supabase.rpc('create_booking', {
        p_doctor_id: selectedDoctorId,
        p_service_id: selectedServiceId,
        p_patient_name: patient.name.trim(),
        p_patient_phone: patient.phone.trim(),
        p_patient_email: patient.email.trim(),
        p_booking_date: selectedDate,
        p_booking_time: selectedTime.slice(0, 5),
      })

      if (rpcError) throw rpcError

      const booking = data?.[0]
      if (!booking) {
        throw new Error(
          'Booking gagal diproses. Silakan coba lagi atau hubungi klinik.'
        )
      }
      setConfirmedBooking(booking)
    } catch (err) {
      // If the slot was just taken by someone else, refresh the grid so
      // the patient can't retry the same stale slot.
      reloadSlots()
      setSelectedTime(null)
      setSubmitError(
        err?.message ?? 'Booking gagal diproses. Silakan coba lagi.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  function handleBookAnother() {
    setSelectedServiceId(null)
    setSelectedDoctorId(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setPatient(EMPTY_PATIENT)
    setTouched({})
    setSubmitError(null)
    setConfirmedBooking(null)
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <ConfigWarning />
      </div>
    )
  }

  if (confirmedBooking) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <BookingConfirmation
          booking={confirmedBooking}
          onBookAnother={handleBookAnother}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6 pb-28">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-slate-900">Booking Klinik Gigi</h1>
        <p className="text-sm text-slate-500">
          Pilih layanan, dokter, dan jadwal yang tersedia.
        </p>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <ServiceSelector
            services={services}
            loading={loading}
            error={error}
            onRetry={reload}
            selectedServiceId={selectedServiceId}
            onSelect={handleSelectService}
          />

          {selectedServiceId && !loading && !error && (
            <DoctorSelector
              doctors={eligibleDoctors}
              selectedDoctorId={selectedDoctorId}
              onSelect={handleSelectDoctor}
            />
          )}

          {selectedDoctorId && (
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

          {selectedTime && (
            <PatientForm
              patient={patient}
              errors={fieldErrors}
              onChange={handlePatientChange}
            />
          )}

          {submitError && <ErrorNotice message={submitError} />}
        </div>

        <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white p-4">
          <div className="mx-auto max-w-md">
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting ? 'Memproses...' : 'Booking Sekarang'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
