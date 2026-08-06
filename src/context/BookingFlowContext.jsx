import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import useCatalog from '../hooks/useCatalog'
import useAvailableSlots from '../hooks/useAvailableSlots'
import { isValidEmail, isValidIndonesianPhone } from '../utils/format'

const EMPTY_PATIENT = { name: '', phone: '', email: '' }

const BookingFlowContext = createContext(null)

// Central store for the guest booking flow (service -> doctor -> date/time
// -> patient info -> confirmation) so state can be shared across routed
// pages without localStorage or query strings. Data-fetching and RPC logic
// here is a direct port of the old single-page BookingPage — nothing about
// validation, RPC calls, or the anti-double-booking flow changed.
export function BookingFlowProvider({ children }) {
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

  // Called from HomePage when tapping a doctor card. `serviceId` is the
  // active category filter on Home (or null if "Semua" was active), and is
  // carried over so DoctorProfilePage can skip the service picker when
  // possible.
  const startBookingWithDoctor = useCallback((doctorId, serviceId) => {
    setSelectedDoctorId(doctorId)
    setSelectedServiceId(serviceId ?? null)
    setSelectedDate(null)
    setSelectedTime(null)
  }, [])

  // Called from DoctorProfilePage when the doctor was opened without a
  // pre-selected service (or the carried-over service isn't one this
  // doctor offers) and the patient picks one from the in-page list.
  const chooseServiceForDoctor = useCallback((serviceId) => {
    setSelectedServiceId(serviceId)
    setSelectedDate(null)
    setSelectedTime(null)
  }, [])

  // Used when a doctor's profile is opened directly (e.g. page refresh /
  // shared link) and the doctor in the URL differs from whatever was in
  // context — start a clean flow for that doctor.
  const setDoctorFromRoute = useCallback((doctorId) => {
    setSelectedDoctorId(doctorId)
    setSelectedServiceId(null)
    setSelectedDate(null)
    setSelectedTime(null)
  }, [])

  const handleSelectDate = useCallback((date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }, [])

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

  async function submitBooking(event) {
    event?.preventDefault?.()
    setTouched({ name: true, phone: true, email: true })
    if (!canSubmit) return false

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
      return true
    } catch (err) {
      // If the slot was just taken by someone else, refresh the grid so
      // the patient can't retry the same stale slot.
      reloadSlots()
      setSelectedTime(null)
      setSubmitError(
        err?.message ?? 'Booking gagal diproses. Silakan coba lagi.'
      )
      return false
    } finally {
      setSubmitting(false)
    }
  }

  function resetFlow() {
    setSelectedServiceId(null)
    setSelectedDoctorId(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setPatient(EMPTY_PATIENT)
    setTouched({})
    setSubmitError(null)
    setConfirmedBooking(null)
  }

  const value = {
    // catalog
    services,
    doctors,
    doctorServices,
    catalogLoading: loading,
    catalogError: error,
    reloadCatalog: reload,
    // selection
    selectedServiceId,
    selectedDoctorId,
    selectedDate,
    selectedTime,
    setSelectedTime,
    startBookingWithDoctor,
    chooseServiceForDoctor,
    setDoctorFromRoute,
    handleSelectDate,
    // slots
    slots,
    slotsLoading,
    slotsError,
    reloadSlots,
    // patient form
    patient,
    fieldErrors,
    handlePatientChange,
    isPatientInfoValid,
    // submit
    canSubmit,
    submitting,
    submitError,
    submitBooking,
    // confirmation
    confirmedBooking,
    resetFlow,
  }

  return (
    <BookingFlowContext.Provider value={value}>
      {children}
    </BookingFlowContext.Provider>
  )
}

export function useBookingFlow() {
  const ctx = useContext(BookingFlowContext)
  if (!ctx) {
    throw new Error('useBookingFlow must be used within a BookingFlowProvider')
  }
  return ctx
}
