import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { ChatService } from '@/gen/chat/v1/chat_pb';

// ブラウザから直接バックエンドに接続するための Transport
// 前編の connect-node とは異なり、connect-web を使用
const transport = createConnectTransport({
  baseUrl: 'http://localhost:8081',
  // Connect プロトコルを使用（gRPC-Web ではなく）
  // HTTP/2 (h2c) でストリーミングをサポート
});

// ChatService クライアントを作成
// このクライアントはブラウザ（クライアントコンポーネント）で使用する
export const chatClient = createClient(ChatService, transport);
