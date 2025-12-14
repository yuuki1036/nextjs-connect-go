'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-node';
import { TodoService } from '@/gen/todo/v1/todo_pb';
import type { Todo } from '@/gen/todo/v1/todo_pb';

function getClient() {
  const transport = createConnectTransport({
    baseUrl: process.env.BACKEND_URL || 'http://localhost:8081',
  });

  return createClient(TodoService, transport);
}

export async function getTodos(): Promise<Todo[]> {
  try {
    const client = getClient();
    const response = await client.listTodos({});
    return response.todos;
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    return [];
  }
}

export async function createTodo(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  if (!title?.trim()) {
    return { error: 'タイトルは必須です' };
  }

  try {
    const client = getClient();
    await client.createTodo({
      title: title.trim(),
      description: description?.trim() || '',
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to create todo:', error);
    return { error: 'TODOの作成に失敗しました' };
  }
}

export async function toggleTodo(id: string, completed: boolean) {
  try {
    const client = getClient();
    await client.updateTodo({
      id,
      completed: !completed,
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to update todo:', error);
    return { error: 'TODOの更新に失敗しました' };
  }
}

export async function deleteTodo(id: string) {
  try {
    const client = getClient();
    await client.deleteTodo({ id });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete todo:', error);
    return { error: 'TODOの削除に失敗しました' };
  }
}
