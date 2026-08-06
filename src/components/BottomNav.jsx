import { useLocation, useNavigate } from 'react-router-dom'
import { useBookingFlow } from '../context/BookingFlowContext'

// Simple 2-item bottom nav: Home, and Booking (returns to the doctor's
// profile page to continue an in-progress booking, or to Home if there's
// no doctor selected yet).
export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { selectedDoctorId } = useBookingFlow()

  const isHomeActive = location.pathname === '/'
  const isBookingActive = location.pathname.startsWith('/doctor/')

  function goToBooking() {
    if (selectedDoctorId) {
      navigate(`/doctor/${selectedDoctorId}`)
    } else {
      navigate('/')
    }
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 h-14 border-t border-slate-200 bg-white">
      <div className="mx-auto flex h-full max-w-md items-stretch justify-around">
        <button
          type="button"
          onClick={() => navigate('/')}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition ${
            isHomeActive ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <span className="text-xl leading-none" aria-hidden="true">
            &#8962;
          </span>
          Home
        </button>
        <button
          type="button"
          onClick={goToBooking}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition ${
            isBookingActive ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <span className="text-xl leading-none" aria-hidden="true">
            &#128197;
          </span>
          Booking
        </button>
      </div>
    </nav>
  )
}
