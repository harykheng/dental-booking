// Shared dummy/placeholder doctor stats + photo fallback.
//
// Rating, review count, years-of-experience, and available-hours are
// DUMMY/placeholder values — these fields do not exist in the `doctors`
// table (id, name, specialization, photo_url, is_active, created_at) and
// are intentionally the SAME for every doctor so it's obvious this is
// placeholder copy, not real per-doctor data. Do not randomize or wire
// these to any table without a BE contract.
//
// IMPORTANT: this file is the single source of truth for these numbers.
// Both `DoctorCard.jsx` (Home list) and `DoctorProfilePage.jsx` import
// from here so the same doctor always shows the same stats in both
// places — don't redefine these constants locally elsewhere.
export const DUMMY_RATING = '5.0'
export const DUMMY_REVIEW_COUNT = 25
export const DUMMY_EXPERIENCE_YEARS = 25
export const DUMMY_AVAILABLE_HOURS = '09:00 - 17:00'
export const DUMMY_PATIENT_COUNT = '500+'

// Deterministic dummy photo fallback: pravatar.cc generates a stable
// avatar image per `u` seed, so using the doctor id as the seed keeps the
// photo consistent across renders/reloads without hardcoding one shared
// image for every doctor.
export function getDummyPhotoUrl(doctorId) {
  return `https://i.pravatar.cc/300?u=${encodeURIComponent(doctorId)}`
}
