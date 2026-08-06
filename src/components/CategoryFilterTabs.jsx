// Horizontal scrolling category tabs on Home, used to filter the doctor
// list by service. `activeCategory` is a service id, or null for "Semua".
export default function CategoryFilterTabs({
  services,
  activeCategory,
  onSelect,
}) {
  return (
    <div className="min-w-0">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            activeCategory === null
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
          }`}
        >
          Semua
        </button>
        {services.map((service) => {
          const isActive = service.id === activeCategory
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelect(service.id)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                isActive
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
              }`}
            >
              {service.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
