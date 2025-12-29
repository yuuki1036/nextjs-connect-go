import { Suspense } from 'react';
import { getTodos } from '../actions/todo';
import { TodoApp } from '../components/TodoApp';

export default function TodoPage() {
  const todosPromise = getTodos();

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">TODO App</h1>
      <Suspense fallback={<div>Loading todos...</div>}>
        <TodoApp todosPromise={todosPromise} />
      </Suspense>
    </div>
  );
}
