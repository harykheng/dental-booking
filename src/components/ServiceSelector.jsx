import { formatRupiah } from '../utils/format'
import Spinner from './ui/Spinner'
import ErrorNotice from './ui/ErrorNotice'
import EmptyNotice from './ui/EmptyNotice'

export default function ServiceSelector({
  services,
  loading,
  error,
  onRetry,
  selectedServiceId,
  onSelect,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">
        Pilih Layanan
      </h2>

      {loading && <Spinner label="Memuat layanan..." />}
      {!loading && error && (
        <div className="mt-3">
          <ErrorNotice message={error} onRetry={onRetry} />
        </div>
      )}
      {!loading && !error && services.length === 0 && (
        <div className="mt-3">
          <EmptyNotice message="Belum ada layanan yang tersedia saat ini. Silakan hubungi klinik langsung." />
        </div>
      )}

      {!loading && !error && services.length > 0 && (
        <div className="mt-3 grid gap-2">
          {services.map((service) => {
            const isSelected = service.id === selectedServiceId
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => onSelect(service.id)}
                className={`flex items-start justify-between gap-3 rounded-lg border p-3 text-left transition ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {service.name}
                  </p>
                  {service.description && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {service.description}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-sm font-semibold text-blue-700">
                  {formatRupiah(service.price)}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
