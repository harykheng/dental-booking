// Header for HomePage: blue banner with large rounded bottom corners,
// dummy visitor identity (avatar initial, name, city), and a decorative
// notification bell. All identity data below is hardcoded UI-only —
// there is no auth/login system yet. When a real login feature ships,
// this is the component to wire up to the logged-in user.
const DUMMY_VISITOR_NAME = 'Budi Santoso'
const DUMMY_VISITOR_LOCATION = 'Jakarta, Indonesia'

export default function HomeHeader() {
  const initial = DUMMY_VISITOR_NAME.charAt(0).toUpperCase()

  return (
    <div className="min-w-0 rounded-b-[2.5rem] bg-blue-600 px-4 pb-12 pt-6 text-white">
      <div className="mx-auto flex max-w-md min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg font-semibold"
            aria-hidden="true"
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">
              {DUMMY_VISITOR_NAME}
            </p>
            <p className="truncate text-xs text-blue-100">
              {DUMMY_VISITOR_LOCATION}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Notifikasi"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg"
        >
          <span aria-hidden="true">&#128276;</span>
        </button>
      </div>
    </div>
  )
}
