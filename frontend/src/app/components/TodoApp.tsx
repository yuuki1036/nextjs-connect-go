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
    <div className="space-y-6">
      <form
        action={handleCreateTodo}
        className="bg-white border border-slate-200 p-5 space-y-3"
      >
        <input
          type="text"
          name="title"
          placeholder="タイトル"
          required
          disabled={isPending}
          className="w-full px-3 py-2 border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <input
          type="text"
          name="description"
          placeholder="説明（オプション）"
          disabled={isPending}
          className="w-full px-3 py-2 border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <button
          type="submit"
          disabled={isPending}
          className="bg-slate-800 text-white px-4 py-2 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? '処理中...' : 'TODO を追加'}
        </button>
      </form>

      <div>
        <h2 className="text-sm font-medium text-slate-600 mb-3">
          TODO 一覧 ({todos.length})
        </h2>

        {todos.length === 0 ? (
          <div className="bg-white border border-slate-200 p-8 text-center">
            <p className="text-sm text-slate-400">TODO がありません</p>
          </div>
        ) : (
          <ul className="border border-slate-200 divide-y divide-slate-200 bg-white">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={`p-4 ${isPending ? 'opacity-60' : ''} ${todo.completed ? 'bg-slate-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo.id, todo.completed)}
                    disabled={isPending}
                    className="mt-0.5 cursor-pointer disabled:cursor-not-allowed"
                  />

                  <div className="flex-1 min-w-0">
                    <div className={todo.completed ? 'line-through text-slate-400' : 'text-slate-800'}>
                      {todo.title}
                    </div>

                    {todo.description && (
                      <p className="mt-1 text-sm text-slate-500">{todo.description}</p>
                    )}

                    <p className="mt-1 text-xs text-slate-400">
                      {timestampDate(todo.createdAt!).toLocaleString('ja-JP')}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    disabled={isPending}
                    className="text-xs text-slate-500 hover:text-slate-700 underline disabled:opacity-50 disabled:cursor-not-allowed"
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
