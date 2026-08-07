// Icon grid used to filter the doctor list by service category. This
// replaces the old CategoryFilterTabs pill row — see HomePage for the
// rationale (single category-filter mechanism instead of two competing
// UIs). `activeCategory` is a service id, or null for "Semua".
//
// No icon library is installed in this project, so categories use simple
// emoji as lightweight, dependency-free icons. Matching is a best-effort
// keyword guess purely for decoration — it never changes filter behavior.
function pickEmoji(serviceName = '') {
  const name = serviceName.toLowerCase()
  if (name.includes('bersih') || name.includes('scaling')) return '\u{1F9BD}' // 🦽 placeholder-ish, replaced below
  if (name.includes('tambal')) return '\u{1FAA5}'
  if (name.includes('cabut')) return '\u{1F9B7}'
  if (name.includes('behel') || name.includes('kawat') || name.includes('orto'))
    return '\u{1F600}'
  if (name.includes('putih') || name.includes('whitening')) return '✨'
  if (name.includes('anak') || name.includes('pediatri')) return '\u{1F476}'
  if (name.includes('akar') || name.includes('saluran')) return '\u{1F9B7}'
  if (name.includes('gusi')) return '\u{1FA78}'
  if (name.includes('implan')) return '\u{1F529}'
  return '\u{1F9B7}' // 🦷 tooth
}

export default function CategoryIconGrid({
  services,
  activeCategory,
  onSelect,
}) {
  return (
    <div className="min-w-0">
      <div className="grid min-w-0 grid-cols-4 gap-3">
        <CategoryIcon
          label="Semua"
          emoji="⭐"
          isActive={activeCategory === null}
          onClick={() => onSelect(null)}
        />
        {services.map((service) => (
          <CategoryIcon
            key={service.id}
            label={service.name}
            emoji={pickEmoji(service.name)}
            isActive={service.id === activeCategory}
            onClick={() => onSelect(service.id)}
          />
        ))}
      </div>
    </div>
  )
}

function CategoryIcon({ label, emoji, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 flex-col items-center gap-1.5"
    >
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl transition ${
          isActive
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-blue-50 text-blue-600'
        }`}
        aria-hidden="true"
      >
        {emoji}
      </span>
      <span className="line-clamp-2 w-full min-w-0 text-center text-[11px] font-medium leading-tight text-slate-600">
        {label}
      </span>
    </button>
  )
}
