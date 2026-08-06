import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Fetches the clinic-hours slot grid for a given doctor/service/date via
// the get_available_slots RPC. Per supabase/README.md, an empty array
// means either an invalid/inactive doctor-service combo, or a Sunday.
export default function useAvailableSlots({ doctorId, serviceId, date }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!doctorId || !serviceId || !date) {
      setSlots([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: rpcError } = await supabase.rpc(
        'get_available_slots',
        { p_doctor_id: doctorId, p_service_id: serviceId, p_date: date }
      )
      if (rpcError) throw rpcError
      setSlots(data ?? [])
    } catch (err) {
      setSlots([])
      setError(
        err?.message ?? 'Gagal memuat jadwal yang tersedia. Silakan coba lagi.'
      )
    } finally {
      setLoading(false)
    }
  }, [doctorId, serviceId, date])

  useEffect(() => {
    load()
  }, [load])

  return { slots, loading, error, reload: load }
}
