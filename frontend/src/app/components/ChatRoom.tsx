'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { chatClient } from '@/lib/chat-client';
import type { ChatMessage } from '@/gen/chat/v1/chat_pb';
import { Code, ConnectError } from '@connectrpc/connect';

export function ChatRoom() {
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが来たら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ストリーミング購読を開始
  useEffect(() => {
    if (!isJoined) return;

    const abortController = new AbortController();
    setIsConnected(true);

    const stream = chatClient.subscribe({}, { signal: abortController.signal });

    (async () => {
      try {
        for await (const message of stream) {
          setMessages(prev => [...prev, message]);
        }
      } catch (error) {
        if (error instanceof ConnectError && error.code === Code.Canceled) {
          return;
        }
        console.error('Failed to receive message:', error);
      } finally {
        setIsConnected(false);
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [isJoined]);

  // メッセージ送信
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      await chatClient.sendMessage({
        user: username,
        content: inputMessage,
      });
      setInputMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // 参加フォーム
  if (!isJoined) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-4">ユーザー名を入力して参加してください</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (username.trim()) {
              setIsJoined(true);
            }
          }}
        >
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザー名"
            className="w-full px-4 py-2 border rounded-lg mb-4 text-gray-800"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            参加する
          </button>
        </form>
      </div>
    );
  }

  // チャット画面
  return (
    <div className="h-[500px] flex flex-col bg-white rounded-lg shadow-md">
      {/* 接続状態インジケーター */}
      <div className="p-3 border-b flex justify-end">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? '接続中' : '切断'}
          </span>
        </div>
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">
            メッセージはまだありません
          </p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.user === username ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${msg.user === username
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
                  }`}
              >
                <p className="text-xs font-semibold mb-1">
                  {msg.user === username ? 'あなた' : msg.user}
                </p>
                <p>{msg.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* メッセージ入力 */}
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 px-4 py-2 border rounded-lg text-gray-800"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          送信
        </button>
      </form>
    </div>
  );
}
