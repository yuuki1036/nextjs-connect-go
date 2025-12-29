import Link from 'next/link';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* ナビゲーション */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <nav className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
            >
              Connect Demo
            </Link>
            <div className="flex gap-1">
              <Link
                href="/todo"
                className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                TODO
              </Link>
              <Link
                href="/chat"
                className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                Chat
              </Link>
            </div>
          </nav>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
