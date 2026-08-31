import Link from 'next/link';
import { FileSpreadsheet, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <div className="space-y-4 max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">404 - Page Not Found</h1>
        <p className="text-xs text-slate-500">
          The requested bank converter or page could not be found. Return to LedgerClean home to convert your PDF bank statements.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to LedgerClean Converter</span>
        </Link>
      </div>
    </div>
  );
}
