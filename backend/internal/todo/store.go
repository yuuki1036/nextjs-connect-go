package todo

import (
	"fmt"
	"sync"

	todov1 "github.com/yuki/nextjs-connect-go/backend/gen/todo/v1"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// Store は TODO アイテムを管理するインターフェース
type Store interface {
	Create(title, description string) (*todov1.Todo, error)
	Get(id string) (*todov1.Todo, error)
	List() ([]*todov1.Todo, error)
	Update(id string, title, description *string, completed *bool) (*todov1.Todo, error)
	Delete(id string) error
}

// InMemoryStore はメモリ上で TODO を管理する実装
type InMemoryStore struct {
	mu      sync.RWMutex
	todos   map[string]*todov1.Todo
	counter int
}

// NewInMemoryStore は新しい InMemoryStore を作成
func NewInMemoryStore() *InMemoryStore {
	return &InMemoryStore{
		todos: make(map[string]*todov1.Todo),
	}
}

// Create は新しい TODO を作成
func (s *InMemoryStore) Create(title, description string) (*todov1.Todo, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.counter++
	id := fmt.Sprintf("todo-%d", s.counter)
	now := timestamppb.Now()

	todo := &todov1.Todo{
		Id:          id,
		Title:       title,
		Description: description,
		Completed:   false,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	s.todos[id] = todo
	return todo, nil
}

// Get は指定された ID の TODO を取得
func (s *InMemoryStore) Get(id string) (*todov1.Todo, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	todo, exists := s.todos[id]
	if !exists {
		return nil, fmt.Errorf("todo not found: %s", id)
	}

	return todo, nil
}

// List はすべての TODO を取得
func (s *InMemoryStore) List() ([]*todov1.Todo, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	todos := make([]*todov1.Todo, 0, len(s.todos))
	for _, todo := range s.todos {
		todos = append(todos, todo)
	}

	return todos, nil
}

// Update は TODO を更新
func (s *InMemoryStore) Update(id string, title, description *string, completed *bool) (*todov1.Todo, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	todo, exists := s.todos[id]
	if !exists {
		return nil, fmt.Errorf("todo not found: %s", id)
	}

	// 部分更新：指定されたフィールドのみ更新
	if title != nil {
		todo.Title = *title
	}
	if description != nil {
		todo.Description = *description
	}
	if completed != nil {
		todo.Completed = *completed
	}

	todo.UpdatedAt = timestamppb.Now()

	return todo, nil
}

// Delete は TODO を削除
func (s *InMemoryStore) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.todos[id]; !exists {
		return fmt.Errorf("todo not found: %s", id)
	}

	delete(s.todos, id)
	return nil
}
