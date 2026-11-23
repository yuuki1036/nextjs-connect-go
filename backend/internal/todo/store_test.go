package todo

import (
	"sort"
	"testing"
)

func ptr[T any](v T) *T { return &v }

func TestInMemoryStore_CreateAndGet(t *testing.T) {
	s := NewInMemoryStore()

	created, err := s.Create("牛乳を買う", "2 本")
	if err != nil {
		t.Fatalf("Create: %v", err)
	}
	if created.Id != "todo-1" {
		t.Errorf("Id = %q, want %q", created.Id, "todo-1")
	}
	if created.Completed {
		t.Error("Completed = true, want false")
	}
	if created.CreatedAt == nil || created.UpdatedAt == nil {
		t.Error("CreatedAt / UpdatedAt が設定されていない")
	}

	got, err := s.Get(created.Id)
	if err != nil {
		t.Fatalf("Get: %v", err)
	}
	if got.Title != "牛乳を買う" || got.Description != "2 本" {
		t.Errorf("Get = {%q, %q}, want {%q, %q}", got.Title, got.Description, "牛乳を買う", "2 本")
	}

	second, err := s.Create("2 件目", "")
	if err != nil {
		t.Fatalf("Create: %v", err)
	}
	if second.Id != "todo-2" {
		t.Errorf("2 件目の Id = %q, want %q", second.Id, "todo-2")
	}
}

func TestInMemoryStore_GetNotFound(t *testing.T) {
	s := NewInMemoryStore()
	if _, err := s.Get("todo-404"); err == nil {
		t.Fatal("存在しない ID で err が nil")
	}
}

func TestInMemoryStore_List(t *testing.T) {
	s := NewInMemoryStore()

	empty, err := s.List()
	if err != nil {
		t.Fatalf("List: %v", err)
	}
	if len(empty) != 0 {
		t.Fatalf("空の store の List の件数 = %d, want 0", len(empty))
	}

	for _, title := range []string{"a", "b", "c"} {
		if _, err := s.Create(title, ""); err != nil {
			t.Fatalf("Create: %v", err)
		}
	}

	todos, err := s.List()
	if err != nil {
		t.Fatalf("List: %v", err)
	}
	ids := make([]string, 0, len(todos))
	for _, td := range todos {
		ids = append(ids, td.Id)
	}
	sort.Strings(ids)
	want := []string{"todo-1", "todo-2", "todo-3"}
	if len(ids) != len(want) {
		t.Fatalf("List の ID = %v, want %v", ids, want)
	}
	for i := range want {
		if ids[i] != want[i] {
			t.Fatalf("List の ID = %v, want %v", ids, want)
		}
	}
}

func TestInMemoryStore_UpdatePartial(t *testing.T) {
	s := NewInMemoryStore()
	created, err := s.Create("元のタイトル", "元の説明")
	if err != nil {
		t.Fatalf("Create: %v", err)
	}
	createdAt := created.CreatedAt.AsTime()

	// completed だけ指定すると、title と description は変わらない
	updated, err := s.Update(created.Id, nil, nil, ptr(true))
	if err != nil {
		t.Fatalf("Update: %v", err)
	}
	if !updated.Completed {
		t.Error("Completed = false, want true")
	}
	if updated.Title != "元のタイトル" || updated.Description != "元の説明" {
		t.Errorf("指定していないフィールドが変わった: {%q, %q}", updated.Title, updated.Description)
	}
	if !updated.CreatedAt.AsTime().Equal(createdAt) {
		t.Error("CreatedAt が変わった")
	}
	if updated.UpdatedAt.AsTime().Before(createdAt) {
		t.Error("UpdatedAt が CreatedAt より前")
	}

	// title と description を空文字に更新できる
	updated, err = s.Update(created.Id, ptr("新しいタイトル"), ptr(""), nil)
	if err != nil {
		t.Fatalf("Update: %v", err)
	}
	if updated.Title != "新しいタイトル" || updated.Description != "" || !updated.Completed {
		t.Errorf("Update = {%q, %q, %v}, want {%q, %q, true}",
			updated.Title, updated.Description, updated.Completed, "新しいタイトル", "")
	}
}

func TestInMemoryStore_UpdateNotFound(t *testing.T) {
	s := NewInMemoryStore()
	if _, err := s.Update("todo-404", ptr("x"), nil, nil); err == nil {
		t.Fatal("存在しない ID で err が nil")
	}
}

func TestInMemoryStore_Delete(t *testing.T) {
	s := NewInMemoryStore()
	created, err := s.Create("消す", "")
	if err != nil {
		t.Fatalf("Create: %v", err)
	}

	if err := s.Delete(created.Id); err != nil {
		t.Fatalf("Delete: %v", err)
	}
	if _, err := s.Get(created.Id); err == nil {
		t.Error("削除した ID を Get できた")
	}
	if err := s.Delete(created.Id); err == nil {
		t.Error("2 回目の Delete で err が nil")
	}
}
