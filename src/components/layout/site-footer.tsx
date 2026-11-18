export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>CareBridge prototype — synthetic data only. Not for production PHI.</p>
        <p>© {new Date().getFullYear()} CareBridge Demo</p>
      </div>
    </footer>
  );
}
