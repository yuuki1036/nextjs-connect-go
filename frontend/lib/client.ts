import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { TodoService } from "@/src/gen/todo/v1/todo_pb";

// Connect トランスポートの作成
const transport = createConnectTransport({
  baseUrl: "http://localhost:8081",
});

// クライアントを作成
export const todoClient = createClient(TodoService, transport);
