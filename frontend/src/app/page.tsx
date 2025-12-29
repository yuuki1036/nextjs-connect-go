export default function Page() {
  return (
    <div className="max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Connect × Next.js × Go
      </h1>
      <p className="text-gray-600">
        gRPC 互換の Connect を使った検証プロジェクトです。
      </p>
      <ul className="mt-4 text-gray-600 list-disc list-inside">
        <li>TODO App - Unary RPC（Server Actions 経由）</li>
        <li>Chat App - Server Streaming RPC（ブラウザ直接）</li>
      </ul>
    </div>
  );
}
