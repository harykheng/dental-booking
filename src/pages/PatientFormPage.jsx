import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookingFlow } from '../context/BookingFlowContext'
import PatientForm from '../components/PatientForm'
import ErrorNotice from '../components/ui/ErrorNotice'

export default function PatientFormPage() {
  const navigate = useNavigate()
  const {
    selectedDoctorId,
    selectedServiceId,
    selectedDate,
    selectedTime,
    patient,
    fieldErrors,
    handlePatientChange,
    canSubmit,
    submitting,
    submitError,
    submitBooking,
    confirmedBooking,
  } = useBookingFlow()

  const hasCompleteSelection =
    !!selectedDoctorId && !!selectedServiceId && !!selectedDate && !!selectedTime

  // Guard: this page only makes sense mid-flow. If it's opened directly
  // (refresh, back button after a reset) without a full selection, send
  // the patient back to Home rather than showing a broken form. Skipped
  // right after a failed submit, since that also clears selectedTime (see
  // submitBooking) and we handle that redirect explicitly below instead.
  useEffect(() => {
    if (!hasCompleteSelection && !confirmedBooking && !submitError) {
      navigate('/', { replace: true })
    }
  }, [hasCompleteSelection, confirmedBooking, submitError, navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    const success = await submitBooking(event)
    if (success) {
      navigate('/book/confirmation')
    } else if (selectedDoctorId) {
      // Slot was likely taken by someone else: send the patient back to
      // the doctor's profile page to pick a new time (the slot grid there
      // was already refreshed by submitBooking).
      navigate(`/doctor/${selectedDoctorId}`)
    }
  }

  if (!hasCompleteSelection) {
    return null
  }

  return (
    <div className="mx-auto min-w-0 max-w-md px-4 py-6 pb-28">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-slate-900">Data Diri Pasien</h1>
        <p className="text-sm text-slate-500">
          Lengkapi data diri untuk menyelesaikan booking.
        </p>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <PatientForm
            patient={patient}
            errors={fieldErrors}
            onChange={handlePatientChange}
          />

          {submitError && <ErrorNotice message={submitError} />}
        </div>

        <div className="fixed inset-x-0 bottom-14 border-t border-slate-200 bg-white p-4">
          <div className="mx-auto max-w-md">
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting ? 'Memproses...' : 'Booking Sekarang'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
