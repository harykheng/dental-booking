// Small formatting helpers shared across booking components.

export function formatRupiah(amount) {
  if (amount === null || amount === undefined) return ''
  const n = Number(amount)
  if (Number.isNaN(n)) return ''
  return n.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  })
}

// '09:00:00' or '09:00' -> '09:00'
export function formatTime(timeStr) {
  if (!timeStr) return ''
  return timeStr.slice(0, 5)
}

// 'YYYY-MM-DD' -> 'Senin, 10 Agustus 2026'
export function formatDateLong(dateStr) {
  if (!dateStr) return ''
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Returns YYYY-MM-DD for a Date object, in local time (avoids UTC
// off-by-one when the browser timezone is behind UTC).
export function toDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Build the next `count` selectable calendar days starting today, skipping
// Sundays (clinic is closed) since the backend rejects Sunday bookings.
export function getUpcomingClinicDays(count = 14) {
  const days = []
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  while (days.length < count) {
    if (cursor.getDay() !== 0) {
      days.push({
        value: toDateInputValue(cursor),
        label: cursor.toLocaleDateString('id-ID', { weekday: 'short' }),
        dayNumber: cursor.getDate(),
        month: cursor.toLocaleDateString('id-ID', { month: 'short' }),
      })
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

const PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{6,10}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidIndonesianPhone(phone) {
  return PHONE_REGEX.test(phone.trim())
}

export function isValidEmail(email) {
  return EMAIL_REGEX.test(email.trim())
}
