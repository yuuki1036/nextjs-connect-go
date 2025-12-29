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
      {/* TODO 作成フォーム */}
      <form
        action={handleCreateTodo}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4"
      >
        <input
          type="text"
          name="title"
          placeholder="タイトル"
          required
          disabled={isPending}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <input
          type="text"
          name="description"
          placeholder="説明（オプション）"
          disabled={isPending}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? '処理中...' : 'TODO を追加'}
        </button>
      </form>

      {/* TODO 一覧 */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          TODO 一覧
          <span className="ml-2 text-sm font-normal text-slate-500">
            ({todos.length}件)
          </span>
        </h2>

        {todos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-400">TODO がありません</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-5 transition-all ${
                  isPending ? 'opacity-60' : ''
                } ${todo.completed ? 'bg-slate-50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo.id, todo.completed)}
                    disabled={isPending}
                    className="mt-1 w-5 h-5 rounded-md border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                  />

                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-medium ${
                        todo.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-800'
                      }`}
                    >
                      {todo.title}
                    </div>

                    {todo.description && (
                      <p className="mt-1 text-sm text-slate-500">
                        {todo.description}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-slate-400">
                      作成: {timestampDate(todo.createdAt!).toLocaleString('ja-JP')}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    disabled={isPending}
                    className="px-3 py-1.5 text-sm text-red-600 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
