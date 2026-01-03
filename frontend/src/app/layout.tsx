import Link from 'next/link';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
          <nav className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold text-slate-800">
              Connect Demo
            </Link>
            <div className="flex gap-4 text-sm">
              <Link
                href="/todo"
                className="text-slate-600 hover:text-slate-900"
              >
                TODO
              </Link>
              <Link
                href="/chat"
                className="text-slate-600 hover:text-slate-900"
              >
                Chat
              </Link>
            </div>
          </nav>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
