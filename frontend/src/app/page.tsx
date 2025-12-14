import { getTodos } from './actions/todo';
import { TodoApp } from './components/TodoApp';

export default async function Page() {
  // Server Componentで初期データを取得
  const initialTodos = await getTodos();

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Connect TODO App (BFF Pattern)</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        Next.js Server Actions + Connect-Node
      </p>

      <TodoApp initialTodos={initialTodos} />
    </div>
  );
}
