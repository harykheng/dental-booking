// "Kategori Unggulan" cards: common dental complaints shown to inspire a
// booking. Content is dummy copy (no backing table for patient
// complaints yet) — the CTA intentionally does not map to any specific
// service_id, since these complaints don't correspond to real catalog
// rows. Tapping "Booking Sekarang" just scrolls the patient down to the
// real doctor list to start a generic booking.
const DUMMY_COMPLAINTS = [
  {
    id: 'sakit-gigi',
    emoji: '\u{1F62B}',
    title: 'Sakit Gigi',
    description: 'Nyeri berdenyut pada gigi? Konsultasikan segera sebelum makin parah.',
  },
  {
    id: 'gigi-sensitif',
    emoji: '\u{1F976}',
    title: 'Gigi Sensitif',
    description: 'Ngilu saat minum atau makan yang dingin dan panas.',
  },
  {
    id: 'gusi-berdarah',
    emoji: '\u{1FA78}',
    title: 'Gusi Berdarah',
    description: 'Gusi mudah berdarah saat sikat gigi bisa jadi tanda radang gusi.',
  },
  {
    id: 'karang-gigi',
    emoji: '\u{1F9B7}',
    title: 'Karang Gigi',
    description: 'Plak yang mengeras dan menumpuk, perlu dibersihkan oleh dokter gigi.',
  },
]

export default function FeaturedComplaintCard({ onBookingClick }) {
  return (
    <div className="min-w-0">
      <h2 className="mb-2 text-base font-semibold text-slate-900">
        Kategori Unggulan
      </h2>
      <div className="grid min-w-0 gap-3">
        {DUMMY_COMPLAINTS.map((complaint) => (
          <div
            key={complaint.id}
            className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">
                {complaint.title}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {complaint.description}
              </p>
              <button
                type="button"
                onClick={onBookingClick}
                className="mt-2 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
              >
                Booking Sekarang
              </button>
            </div>
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-2xl"
              aria-hidden="true"
            >
              {complaint.emoji}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
