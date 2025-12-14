import { Suspense } from 'react';
import { getTodos } from './actions/todo';
import { TodoApp } from './components/TodoApp';

export default function Page() {
  const todosPromise = getTodos();

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Connect TODO App (BFF Pattern)</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        Next.js Server Actions + Connect-Node
      </p>

      <Suspense fallback={<div>Loading todos...</div>}>
        <TodoApp todosPromise={todosPromise} />
      </Suspense>
    </div>
  );
}
