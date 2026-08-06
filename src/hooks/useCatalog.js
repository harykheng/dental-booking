import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Fetches the booking catalog: active services, active doctors, and the
// doctor<->service relation used to filter which doctors offer a given
// service. Contract per supabase/README.md:
//   services.select('*').eq('is_active', true)
//   doctors.select('*').eq('is_active', true)
//   doctor_services.select('*')
export default function useCatalog() {
  const [services, setServices] = useState([])
  const [doctors, setDoctors] = useState([])
  const [doctorServices, setDoctorServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [servicesRes, doctorsRes, doctorServicesRes] = await Promise.all([
        supabase.from('services').select('*').eq('is_active', true),
        supabase.from('doctors').select('*').eq('is_active', true),
        supabase.from('doctor_services').select('*'),
      ])

      if (servicesRes.error) throw servicesRes.error
      if (doctorsRes.error) throw doctorsRes.error
      if (doctorServicesRes.error) throw doctorServicesRes.error

      setServices(servicesRes.data ?? [])
      setDoctors(doctorsRes.data ?? [])
      setDoctorServices(doctorServicesRes.data ?? [])
    } catch (err) {
      setError(
        err?.message ??
          'Gagal memuat data layanan dan dokter. Silakan coba lagi.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { services, doctors, doctorServices, loading, error, reload: load }
}
