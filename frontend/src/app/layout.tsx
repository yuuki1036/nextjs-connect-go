import Link from 'next/link';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        {/* 共通ナビゲーション */}
        <header className="bg-white border-b">
          <nav className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-6">
            <Link href="/" className="font-bold text-gray-800">
              Connect Demo
            </Link>
            <div className="flex gap-4">
              <Link
                href="/todo"
                className="text-blue-500 hover:text-blue-700 transition"
              >
                TODO
              </Link>
              <Link
                href="/chat"
                className="text-blue-500 hover:text-blue-700 transition"
              >
                Chat
              </Link>
            </div>
          </nav>
        </header>

        <main className="py-8">{children}</main>
      </body>
    </html>
  );
}
