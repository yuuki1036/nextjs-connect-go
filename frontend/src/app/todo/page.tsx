import { Suspense } from 'react';
import { getTodos } from '../actions/todo';
import { TodoApp } from '../components/TodoApp';

export default function TodoPage() {
  const todosPromise = getTodos();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">TODO App</h1>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        }
      >
        <TodoApp todosPromise={todosPromise} />
      </Suspense>
    </div>
  );
}
