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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">チャットに参加</h2>
        <p className="text-slate-600 text-sm mb-6">ユーザー名を入力してください</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (username.trim()) {
              setIsJoined(true);
            }
          }}
          className="space-y-4"
        >
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザー名"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium py-3 rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all shadow-sm hover:shadow-md"
          >
            参加する
          </button>
        </form>
      </div>
    );
  }

  // チャット画面
  return (
    <div className="h-[500px] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <span className="text-sm text-slate-600">
          <span className="font-medium text-slate-800">{username}</span> としてログイン中
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}
          />
          <span className="text-sm text-slate-600">
            {isConnected ? '接続中' : '切断'}
          </span>
        </div>
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400">メッセージはまだありません</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.user === username ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2.5 rounded-2xl ${
                  msg.user === username
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-br-md'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md shadow-sm'
                }`}
              >
                <p className={`text-xs font-medium mb-1 ${msg.user === username ? 'text-teal-100' : 'text-slate-500'}`}>
                  {msg.user === username ? 'あなた' : msg.user}
                </p>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* メッセージ入力 */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex gap-3 bg-white">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-2.5 rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all font-medium shadow-sm hover:shadow-md"
        >
          送信
        </button>
      </form>
    </div>
  );
}
