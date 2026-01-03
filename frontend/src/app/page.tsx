export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          Connect × Next.js × Go
        </h1>
        <p className="mt-1 text-slate-600">
          gRPC 互換の Connect を使った検証プロジェクト
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href="/todo"
          className="block p-5 bg-white border border-slate-200 hover:border-slate-300"
        >
          <h2 className="font-medium text-slate-800">TODO App</h2>
          <p className="mt-1 text-slate-500 text-sm">
            Unary RPC / Server Actions 経由
          </p>
          <p className="mt-3 text-xs text-slate-400">HTTP/1.1</p>
        </a>

        <a
          href="/chat"
          className="block p-5 bg-white border border-slate-200 hover:border-slate-300"
        >
          <h2 className="font-medium text-slate-800">Chat App</h2>
          <p className="mt-1 text-slate-500 text-sm">
            Server Streaming RPC / ブラウザ直接
          </p>
          <p className="mt-3 text-xs text-slate-400">HTTP/2 (h2c)</p>
        </a>
      </div>
    </div>
  );
}
