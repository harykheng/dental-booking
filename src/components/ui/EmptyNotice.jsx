export default function EmptyNotice({ message }) {
  if (!message) return null
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
      {message}
    </div>
  )
}
