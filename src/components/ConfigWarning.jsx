export default function ConfigWarning() {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
      <p className="font-semibold">Konfigurasi Supabase belum lengkap.</p>
      <p className="mt-1">
        Salin <code className="rounded bg-amber-100 px-1">.env.example</code> menjadi{' '}
        <code className="rounded bg-amber-100 px-1">.env</code> di root project, lalu isi{' '}
        <code className="rounded bg-amber-100 px-1">VITE_SUPABASE_URL</code> dan{' '}
        <code className="rounded bg-amber-100 px-1">VITE_SUPABASE_ANON_KEY</code> dari
        Project Settings &gt; API di dashboard Supabase, lalu jalankan ulang server dev.
      </p>
    </div>
  )
}
