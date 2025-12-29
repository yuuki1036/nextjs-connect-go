export default function Page() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-800 mb-3">
          Connect × Next.js × Go
        </h1>
        <p className="text-lg text-slate-600">
          gRPC 互換の Connect を使った検証プロジェクトです。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* TODO App Card */}
        <a
          href="/todo"
          className="group p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all"
        >
          <div className="text-3xl mb-3">📝</div>
          <h2 className="text-xl font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
            TODO App
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Unary RPC（Server Actions 経由）
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
              Server Actions
            </span>
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
              HTTP/1.1
            </span>
          </div>
        </a>

        {/* Chat App Card */}
        <a
          href="/chat"
          className="group p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all"
        >
          <div className="text-3xl mb-3">💬</div>
          <h2 className="text-xl font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
            Chat App
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Server Streaming RPC（ブラウザ直接）
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
              Streaming
            </span>
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
              HTTP/2 (h2c)
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}
