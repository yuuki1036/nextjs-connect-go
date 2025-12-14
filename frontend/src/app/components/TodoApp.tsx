'use client';

import { use, useTransition } from 'react';
import type { Todo } from '@/gen/todo/v1/todo_pb';
import { timestampDate } from '@bufbuild/protobuf/wkt';
import { createTodo, toggleTodo, deleteTodo } from '../actions/todo';

interface TodoAppProps {
  todosPromise: Promise<Todo[]>;
}

export function TodoApp({ todosPromise }: TodoAppProps) {
  const todos = use(todosPromise);
  const [isPending, startTransition] = useTransition();

  // TODO作成
  const handleCreateTodo = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createTodo(formData);
      if (result?.error) {
        alert(result.error);
      }
    });
  };

  // TODO完了状態を切り替え
  const handleToggleTodo = async (id: string, completed: boolean) => {
    startTransition(async () => {
      const result = await toggleTodo(id, completed);
      if (result?.error) {
        alert(result.error);
      }
    });
  };

  // TODO削除
  const handleDeleteTodo = async (id: string) => {
    if (!confirm('このTODOを削除しますか？')) return;

    startTransition(async () => {
      const result = await deleteTodo(id);
      if (result?.error) {
        alert(result.error);
      }
    });
  };

  return (
    <>
      {/* TODO 作成フォーム */}
      <form action={handleCreateTodo} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            name="title"
            placeholder="タイトル"
            required
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            disabled={isPending}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            name="description"
            placeholder="説明（オプション）"
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            disabled={isPending}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: isPending ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? '処理中...' : 'TODO を追加'}
        </button>
      </form>

      {/* TODO 一覧 */}
      <div>
        <h2>TODO 一覧 ({todos.length}件)</h2>

        {todos.length === 0 ? (
          <p style={{ color: '#666' }}>TODO がありません</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {todos.map((todo) => (
              <li
                key={todo.id}
                style={{
                  padding: '15px',
                  marginBottom: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: todo.completed ? '#f0f0f0' : 'white',
                  opacity: isPending ? 0.6 : 1,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo.id, todo.completed)}
                    style={{ cursor: 'pointer' }}
                    disabled={isPending}
                  />

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 'bold',
                        textDecoration: todo.completed ? 'line-through' : 'none',
                        color: todo.completed ? '#999' : 'black',
                      }}
                    >
                      {todo.title}
                    </div>

                    {todo.description && (
                      <div
                        style={{
                          fontSize: '14px',
                          color: '#666',
                          marginTop: '4px',
                        }}
                      >
                        {todo.description}
                      </div>
                    )}

                    <div
                      style={{
                        fontSize: '12px',
                        color: '#999',
                        marginTop: '4px',
                      }}
                    >
                      作成: {timestampDate(todo.createdAt!).toLocaleString('ja-JP')}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    disabled={isPending}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: isPending ? '#ccc' : '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isPending ? 'not-allowed' : 'pointer',
                    }}
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
