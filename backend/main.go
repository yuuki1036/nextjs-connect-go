package main

import (
	"fmt"
	"log"
	"net/http"

	"connectrpc.com/connect"
	"connectrpc.com/validate"
	"github.com/yuuki1036/nextjs-connect-go/backend/gen/todo/v1/todov1connect"
	"github.com/yuuki1036/nextjs-connect-go/backend/internal/todo"
)

func main() {
	store := todo.NewInMemoryStore()
	service := todo.NewService(store)

	// protovalidate interceptor
	validateInterceptor := validate.NewInterceptor()

	path, handler := todov1connect.NewTodoServiceHandler(
		service,
		connect.WithInterceptors(validateInterceptor),
	)

	mux := http.NewServeMux()
	mux.Handle(path, handler)

	addr := ":8081"
	fmt.Printf("🚀 Server starting on http://localhost%s\n", addr)
	fmt.Printf("📍 TodoService available at http://localhost%s%s\n", addr, path)

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
