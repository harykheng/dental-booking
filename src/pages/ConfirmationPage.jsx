import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookingFlow } from '../context/BookingFlowContext'
import BookingConfirmation from '../components/BookingConfirmation'

export default function ConfirmationPage() {
  const navigate = useNavigate()
  const { confirmedBooking, resetFlow } = useBookingFlow()

  // Guard: this page only makes sense right after a successful booking.
  // No re-querying here — we only ever show the RPC's own return value.
  useEffect(() => {
    if (!confirmedBooking) {
      navigate('/', { replace: true })
    }
  }, [confirmedBooking, navigate])

  function handleBookAnother() {
    resetFlow()
    navigate('/')
  }

  if (!confirmedBooking) {
    return null
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 pb-24">
      <BookingConfirmation
        booking={confirmedBooking}
        onBookAnother={handleBookAnother}
      />
    </div>
  )
}
