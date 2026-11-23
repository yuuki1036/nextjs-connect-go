package todo

import (
	"context"
	"errors"
	"testing"

	"connectrpc.com/connect"
	todov1 "github.com/yuuki1036/nextjs-connect-go/backend/gen/todo/v1"
)

func assertCode(t *testing.T, err error, want connect.Code) {
	t.Helper()
	if err == nil {
		t.Fatalf("err = nil, want code %v", want)
	}
	var cerr *connect.Error
	if !errors.As(err, &cerr) {
		t.Fatalf("err = %v, want *connect.Error", err)
	}
	if cerr.Code() != want {
		t.Fatalf("code = %v, want %v", cerr.Code(), want)
	}
}

func TestService_CRUD(t *testing.T) {
	ctx := context.Background()
	svc := NewService(NewInMemoryStore())

	created, err := svc.CreateTodo(ctx, connect.NewRequest(&todov1.CreateTodoRequest{
		Title:       "テストを書く",
		Description: "backend の service",
	}))
	if err != nil {
		t.Fatalf("CreateTodo: %v", err)
	}
	id := created.Msg.Todo.Id

	got, err := svc.GetTodo(ctx, connect.NewRequest(&todov1.GetTodoRequest{Id: id}))
	if err != nil {
		t.Fatalf("GetTodo: %v", err)
	}
	if got.Msg.Todo.Title != "テストを書く" {
		t.Errorf("Title = %q, want %q", got.Msg.Todo.Title, "テストを書く")
	}

	updated, err := svc.UpdateTodo(ctx, connect.NewRequest(&todov1.UpdateTodoRequest{
		Id:        id,
		Completed: ptr(true),
	}))
	if err != nil {
		t.Fatalf("UpdateTodo: %v", err)
	}
	if !updated.Msg.Todo.Completed || updated.Msg.Todo.Title != "テストを書く" {
		t.Errorf("UpdateTodo = {%q, %v}, want {%q, true}",
			updated.Msg.Todo.Title, updated.Msg.Todo.Completed, "テストを書く")
	}

	list, err := svc.ListTodos(ctx, connect.NewRequest(&todov1.ListTodosRequest{}))
	if err != nil {
		t.Fatalf("ListTodos: %v", err)
	}
	if len(list.Msg.Todos) != 1 {
		t.Errorf("ListTodos の件数 = %d, want 1", len(list.Msg.Todos))
	}

	deleted, err := svc.DeleteTodo(ctx, connect.NewRequest(&todov1.DeleteTodoRequest{Id: id}))
	if err != nil {
		t.Fatalf("DeleteTodo: %v", err)
	}
	if !deleted.Msg.Success {
		t.Error("Success = false, want true")
	}

	list, err = svc.ListTodos(ctx, connect.NewRequest(&todov1.ListTodosRequest{}))
	if err != nil {
		t.Fatalf("ListTodos: %v", err)
	}
	if len(list.Msg.Todos) != 0 {
		t.Errorf("削除後の ListTodos の件数 = %d, want 0", len(list.Msg.Todos))
	}
}

func TestService_NotFound(t *testing.T) {
	ctx := context.Background()
	svc := NewService(NewInMemoryStore())

	_, err := svc.GetTodo(ctx, connect.NewRequest(&todov1.GetTodoRequest{Id: "todo-404"}))
	assertCode(t, err, connect.CodeNotFound)

	_, err = svc.UpdateTodo(ctx, connect.NewRequest(&todov1.UpdateTodoRequest{Id: "todo-404", Title: ptr("x")}))
	assertCode(t, err, connect.CodeNotFound)

	_, err = svc.DeleteTodo(ctx, connect.NewRequest(&todov1.DeleteTodoRequest{Id: "todo-404"}))
	assertCode(t, err, connect.CodeNotFound)
}

// failingStore は Store のエラーが CodeInternal になることを確かめるための Store
type failingStore struct{ Store }

var errStore = errors.New("store が壊れている")

func (failingStore) Create(string, string) (*todov1.Todo, error) { return nil, errStore }
func (failingStore) List() ([]*todov1.Todo, error)               { return nil, errStore }

func TestService_StoreErrorIsInternal(t *testing.T) {
	ctx := context.Background()
	svc := NewService(failingStore{})

	_, err := svc.CreateTodo(ctx, connect.NewRequest(&todov1.CreateTodoRequest{Title: "x"}))
	assertCode(t, err, connect.CodeInternal)

	_, err = svc.ListTodos(ctx, connect.NewRequest(&todov1.ListTodosRequest{}))
	assertCode(t, err, connect.CodeInternal)
}
