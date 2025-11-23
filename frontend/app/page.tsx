'use client';

import { useState, useEffect } from 'react';
import { todoClient } from '@/lib/client';
import type { Todo } from '@/src/gen/todo/v1/todo_pb';
import { timestampDate } from '@bufbuild/protobuf/wkt';

export default function Page() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // TODO 一覧を取得
  const fetchTodos = async () => {
    try {
      const response = await todoClient.listTodos({});
      setTodos(response.todos);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  };

  // 初回ロード時に TODO を取得
  useEffect(() => {
    fetchTodos();
  }, []);

  // TODO を作成
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setLoading(true);
    try {
      await todoClient.createTodo({
        title: newTitle,
        description: newDescription,
      });

      // フォームをクリア
      setNewTitle('');
      setNewDescription('');

      // TODO 一覧を再取得
      await fetchTodos();
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setLoading(false);
    }
  };

  // TODO を更新（完了状態を切り替え）
  const handleToggle = async (todo: Todo) => {
    try {
      await todoClient.updateTodo({
        id: todo.id,
        completed: !todo.completed,
      });

      // TODO 一覧を再取得
      await fetchTodos();
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  // TODO を削除
  const handleDelete = async (id: string) => {
    try {
      await todoClient.deleteTodo({ id });

      // TODO 一覧を再取得
      await fetchTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Connect TODO App</h1>

      {/* TODO 作成フォーム */}
      <form onSubmit={handleCreate} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="タイトル"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="説明（オプション）"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !newTitle.trim()}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '追加中...' : 'TODO を追加'}
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
                    onChange={() => handleToggle(todo)}
                    style={{ cursor: 'pointer' }}
                  />

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 'bold',
                        textDecoration: todo.completed
                          ? 'line-through'
                          : 'none',
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
                    onClick={() => handleDelete(todo.id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
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
    </div>
  );
}
