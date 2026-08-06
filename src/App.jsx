import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { isSupabaseConfigured } from './lib/supabaseClient'
import { BookingFlowProvider } from './context/BookingFlowContext'
import ConfigWarning from './components/ConfigWarning'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import DoctorProfilePage from './pages/DoctorProfilePage'
import PatientFormPage from './pages/PatientFormPage'
import ConfirmationPage from './pages/ConfirmationPage'

function App() {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-md px-4 py-10">
          <ConfigWarning />
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <BookingFlowProvider>
        <div className="min-h-screen bg-slate-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/doctor/:doctorId" element={<DoctorProfilePage />} />
            <Route path="/book/confirm" element={<PatientFormPage />} />
            <Route path="/book/confirmation" element={<ConfirmationPage />} />
          </Routes>
          <BottomNav />
        </div>
      </BookingFlowProvider>
    </BrowserRouter>
  )
}

export default App
