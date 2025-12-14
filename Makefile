.PHONY: help setup install gen dev dev-backend dev-frontend build clean clean-gen clean-build

# デフォルトターゲット
.DEFAULT_GOAL := help

# ヘルプメッセージ
help: ## このヘルプメッセージを表示
	@echo "使用可能なコマンド:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ========================================
# セットアップ
# ========================================

setup: install gen ## 初期セットアップ（依存関係インストール + コード生成）

install: ## 依存関係をインストール
	@echo "📦 フロントエンド依存関係をインストール中..."
	cd frontend && npm install
	@echo "📦 バックエンド依存関係をインストール中..."
	cd backend && go mod download
	@echo "✅ 依存関係のインストール完了"

# ========================================
# コード生成
# ========================================

gen: ## Protocol Buffersからコードを生成
	@echo "🔨 Protocol Buffersからコードを生成中..."
	cd proto && buf generate
	@echo "✅ コード生成完了"

# ========================================
# 開発
# ========================================

dev: ## 開発サーバーを起動（フロントエンド + バックエンド）
	@echo "🚀 開発サーバーを起動します..."
	@echo ""
	@echo "ターミナルを2つ開いて、それぞれ以下を実行してください:"
	@echo "  ターミナル1: make dev-backend"
	@echo "  ターミナル2: make dev-frontend"
	@echo ""
	@echo "または、並列実行したい場合:"
	@echo "  make dev-parallel"

dev-parallel: ## 開発サーバーを並列起動（要: GNU parallel）
	@echo "🚀 開発サーバーを並列起動中..."
	@parallel --ungroup ::: 'make dev-backend' 'make dev-frontend'

dev-backend: build-backend ## バックエンド開発サーバーを起動
	@echo "🚀 バックエンドサーバーを起動中 (http://localhost:8081)..."
	cd backend && ./bin/server

dev-frontend: ## フロントエンド開発サーバーを起動
	@echo "🚀 フロントエンドサーバーを起動中 (http://localhost:3000)..."
	cd frontend && npm run dev

# ========================================
# ビルド
# ========================================

build: build-backend ## すべてをビルド

build-backend: ## バックエンドをビルド
	@echo "🔨 バックエンドをビルド中..."
	cd backend && go build -o bin/server .
	@echo "✅ ビルド完了: backend/bin/server"

# ========================================
# クリーン
# ========================================

clean: clean-gen clean-build ## すべてのビルド成果物を削除

clean-gen: ## 生成されたコードを削除
	@echo "🧹 生成されたコードを削除中..."
	rm -rf backend/gen/*
	rm -rf frontend/src/gen/*
	@echo "✅ 生成コードの削除完了"

clean-build: ## ビルド成果物を削除
	@echo "🧹 ビルド成果物を削除中..."
	rm -rf backend/bin
	rm -rf frontend/.next
	rm -rf frontend/out
	@echo "✅ ビルド成果物の削除完了"

# ========================================
# テスト（将来の拡張用）
# ========================================

test: ## テストを実行（未実装）
	@echo "⚠️  テストは未実装です"

test-backend: ## バックエンドのテストを実行（未実装）
	@echo "⚠️  バックエンドのテストは未実装です"

test-frontend: ## フロントエンドのテストを実行（未実装）
	@echo "⚠️  フロントエンドのテストは未実装です"
