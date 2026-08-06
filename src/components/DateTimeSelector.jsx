import { getUpcomingClinicDays, formatTime } from '../utils/format'
import Spinner from './ui/Spinner'
import ErrorNotice from './ui/ErrorNotice'
import EmptyNotice from './ui/EmptyNotice'

const clinicDays = getUpcomingClinicDays(14)

export default function DateTimeSelector({
  selectedDate,
  onSelectDate,
  slots,
  slotsLoading,
  slotsError,
  onRetrySlots,
  selectedTime,
  onSelectTime,
}) {
  const hasAvailableSlot = slots.some((slot) => slot.is_available)

  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">
        Pilih Tanggal &amp; Jam
      </h2>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {clinicDays.map((day) => {
          const isSelected = day.value === selectedDate
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => onSelectDate(day.value)}
              className={`flex shrink-0 flex-col items-center rounded-lg border px-3 py-2 text-center transition ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <span className="text-[11px] uppercase text-slate-500">
                {day.label}
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {day.dayNumber}
              </span>
              <span className="text-[11px] text-slate-500">{day.month}</span>
            </button>
          )
        })}
      </div>

      {selectedDate && (
        <div className="mt-4">
          {slotsLoading && <Spinner label="Memuat jadwal tersedia..." />}

          {!slotsLoading && slotsError && (
            <ErrorNotice message={slotsError} onRetry={onRetrySlots} />
          )}

          {!slotsLoading && !slotsError && slots.length === 0 && (
            <EmptyNotice message="Klinik tutup di tanggal ini (hari Minggu) atau kombinasi dokter/layanan tidak valid. Silakan pilih tanggal lain." />
          )}

          {!slotsLoading && !slotsError && slots.length > 0 && !hasAvailableSlot && (
            <EmptyNotice message="Semua jadwal di tanggal ini sudah penuh. Silakan pilih tanggal lain." />
          )}

          {!slotsLoading && !slotsError && hasAvailableSlot && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => {
                const isSelected = slot.slot_time === selectedTime
                return (
                  <button
                    key={slot.slot_time}
                    type="button"
                    disabled={!slot.is_available}
                    onClick={() => onSelectTime(slot.slot_time)}
                    className={`rounded-lg border py-2 text-sm transition ${
                      !slot.is_available
                        ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through'
                        : isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    {formatTime(slot.slot_time)}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
