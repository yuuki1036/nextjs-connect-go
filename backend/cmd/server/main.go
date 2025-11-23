package main

import (
	"fmt"
	"log"
	"net/http"

	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"

	"github.com/yuki/nextjs-connect-go/backend/gen/todo/v1/todov1connect"
	"github.com/yuki/nextjs-connect-go/backend/internal/todo"
)

func main() {
	// ストアとサービスの初期化
	store := todo.NewInMemoryStore()
	service := todo.NewService(store)

	// Connect ハンドラーの作成
	path, handler := todov1connect.NewTodoServiceHandler(service)

	// マルチプレクサの作成
	mux := http.NewServeMux()
	mux.Handle(path, handler)

	// CORS ミドルウェアを適用
	corsHandler := newCORSHandler(mux)

	// HTTP/2 対応（h2c = HTTP/2 Cleartext）
	h2cHandler := h2c.NewHandler(corsHandler, &http2.Server{})

	// サーバー起動
	addr := ":8081"
	fmt.Printf("🚀 Server starting on http://localhost%s\n", addr)
	fmt.Printf("📍 TodoService available at http://localhost%s%s\n", addr, path)

	if err := http.ListenAndServe(addr, h2cHandler); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// newCORSHandler は CORS ヘッダーを追加するミドルウェア
func newCORSHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// CORS ヘッダーの設定
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Connect-Protocol-Version, Connect-Timeout-Ms")
		w.Header().Set("Access-Control-Expose-Headers", "Connect-Protocol-Version, Connect-Timeout-Ms")

		// プリフライトリクエストの処理
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// 次のハンドラーを呼び出し
		next.ServeHTTP(w, r)
	})
}
