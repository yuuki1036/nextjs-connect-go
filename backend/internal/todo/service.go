package todo

import (
	"context"

	"connectrpc.com/connect"
	todov1 "github.com/yuuki1036/nextjs-connect-go/backend/gen/todo/v1"
	"github.com/yuuki1036/nextjs-connect-go/backend/gen/todo/v1/todov1connect"
)

// Service は TodoService の実装
type Service struct {
	store Store
}

// NewService は新しい Service を作成
func NewService(store Store) *Service {
	return &Service{
		store: store,
	}
}

// コンパイル時に TodoServiceHandler インターフェースを実装しているか確認
var _ todov1connect.TodoServiceHandler = (*Service)(nil)

// CreateTodo は新しい TODO を作成
func (s *Service) CreateTodo(
	ctx context.Context,
	req *connect.Request[todov1.CreateTodoRequest],
) (*connect.Response[todov1.CreateTodoResponse], error) {
	todo, err := s.store.Create(req.Msg.Title, req.Msg.Description)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&todov1.CreateTodoResponse{
		Todo: todo,
	}), nil
}

// GetTodo は指定された ID の TODO を取得
func (s *Service) GetTodo(
	ctx context.Context,
	req *connect.Request[todov1.GetTodoRequest],
) (*connect.Response[todov1.GetTodoResponse], error) {
	todo, err := s.store.Get(req.Msg.Id)
	if err != nil {
		return nil, connect.NewError(connect.CodeNotFound, err)
	}

	return connect.NewResponse(&todov1.GetTodoResponse{
		Todo: todo,
	}), nil
}

// ListTodos はすべての TODO を取得
func (s *Service) ListTodos(
	ctx context.Context,
	req *connect.Request[todov1.ListTodosRequest],
) (*connect.Response[todov1.ListTodosResponse], error) {
	todos, err := s.store.List()
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&todov1.ListTodosResponse{
		Todos: todos,
	}), nil
}

// UpdateTodo は TODO を更新
func (s *Service) UpdateTodo(
	ctx context.Context,
	req *connect.Request[todov1.UpdateTodoRequest],
) (*connect.Response[todov1.UpdateTodoResponse], error) {
	// optional フィールドの処理
	var title, description *string
	var completed *bool

	if req.Msg.Title != nil {
		title = req.Msg.Title
	}
	if req.Msg.Description != nil {
		description = req.Msg.Description
	}
	if req.Msg.Completed != nil {
		completed = req.Msg.Completed
	}

	todo, err := s.store.Update(req.Msg.Id, title, description, completed)
	if err != nil {
		return nil, connect.NewError(connect.CodeNotFound, err)
	}

	return connect.NewResponse(&todov1.UpdateTodoResponse{
		Todo: todo,
	}), nil
}

// DeleteTodo は TODO を削除
func (s *Service) DeleteTodo(
	ctx context.Context,
	req *connect.Request[todov1.DeleteTodoRequest],
) (*connect.Response[todov1.DeleteTodoResponse], error) {
	err := s.store.Delete(req.Msg.Id)
	if err != nil {
		return nil, connect.NewError(connect.CodeNotFound, err)
	}

	return connect.NewResponse(&todov1.DeleteTodoResponse{
		Success: true,
	}), nil
}
