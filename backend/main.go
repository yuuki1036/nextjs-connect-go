package main

import (
	"fmt"
	"log"
	"net/http"

	"connectrpc.com/connect"
	"connectrpc.com/validate"
	"github.com/rs/cors"
	"github.com/yuuki1036/nextjs-connect-go/backend/gen/chat/v1/chatv1connect"
	"github.com/yuuki1036/nextjs-connect-go/backend/gen/todo/v1/todov1connect"
	"github.com/yuuki1036/nextjs-connect-go/backend/internal/chat"
	"github.com/yuuki1036/nextjs-connect-go/backend/internal/todo"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
)

func main() {
	// protovalidate interceptor
	validateInterceptor := validate.NewInterceptor()

	todoStore := todo.NewInMemoryStore()
	todoService := todo.NewService(todoStore)
	todoPath, todoHandler := todov1connect.NewTodoServiceHandler(
		todoService,
		connect.WithInterceptors(validateInterceptor),
	)

	chatService := chat.NewService()
	chatPath, chatHandler := chatv1connect.NewChatServiceHandler(
		chatService,
		connect.WithInterceptors(validateInterceptor),
	)

	mux := http.NewServeMux()
	mux.Handle(todoPath, todoHandler)
	mux.Handle(chatPath, chatHandler)

	// CORS設定（ブラウザからの直接アクセスを許可）
	corsHandler := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{
			"Content-Type",
			"Connect-Protocol-Version",
			"Connect-Timeout-Ms",
			"Grpc-Timeout",
			"X-Grpc-Web",
			"X-User-Agent",
		},
		ExposedHeaders: []string{
			"Grpc-Status",
			"Grpc-Message",
			"Grpc-Status-Details-Bin",
		},
	}).Handler(mux)

	addr := ":8081"
	fmt.Printf("🚀 Server starting on http://localhost%s\n", addr)
	fmt.Printf("📍 TodoService available at http://localhost%s%s\n", addr, todoPath)
	fmt.Printf("📍 ChatService available at http://localhost%s%s\n", addr, chatPath)

	// h2c: HTTP/2 over cleartext（TLSなしでHTTP/2を使用）
	h2cHandler := h2c.NewHandler(corsHandler, &http2.Server{})

	if err := http.ListenAndServe(addr, h2cHandler); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
