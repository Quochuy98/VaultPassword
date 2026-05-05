/**
 * Shown when the production build has no Supabase env baked in (common on GitHub Pages
 * if Actions secrets are not set for the build step).
 */
export function MissingSupabaseConfig() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-100 text-slate-900">
      <div className="max-w-lg rounded-2xl bg-white border border-slate-200 shadow-lg p-8 space-y-4">
        <h1 className="text-xl font-bold tracking-tight">Thiếu cấu hình Supabase</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Ứng dụng cần <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> và{' '}
          <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> lúc{' '}
          <strong>build</strong> (Vite nhúng vào bundle).
        </p>
        <div className="text-sm text-slate-700 space-y-2 border-t border-slate-100 pt-4">
          <p className="font-semibold">GitHub Actions (Pages)</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-600">
            <li>Repo → Settings → Secrets and variables → Actions</li>
            <li>Thêm secrets: <code className="text-xs">VITE_SUPABASE_URL</code>, <code className="text-xs">VITE_SUPABASE_ANON_KEY</code></li>
            <li>Chạy lại workflow deploy (nhánh <code className="text-xs">deploy</code>)</li>
          </ol>
        </div>
        <p className="text-xs text-slate-500">
          Local: copy <code className="text-xs">.env.example</code> → <code className="text-xs">.env</code> và điền giá trị.
        </p>
      </div>
    </div>
  );
}
