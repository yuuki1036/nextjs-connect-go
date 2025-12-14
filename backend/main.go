package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/yuuki1036/nextjs-connect-go/backend/gen/todo/v1/todov1connect"
	"github.com/yuuki1036/nextjs-connect-go/backend/internal/todo"
)

func main() {
	store := todo.NewInMemoryStore()
	service := todo.NewService(store)

	path, handler := todov1connect.NewTodoServiceHandler(service)

	mux := http.NewServeMux()
	mux.Handle(path, handler)

	addr := ":8081"
	fmt.Printf("🚀 Server starting on http://localhost%s\n", addr)
	fmt.Printf("📍 TodoService available at http://localhost%s%s\n", addr, path)

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
