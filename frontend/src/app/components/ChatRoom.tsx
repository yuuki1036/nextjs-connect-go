'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { chatClient } from '@/lib/chat-client';
import { MessageType, type ChatMessage } from '@/gen/chat/v1/chat_pb';
import { Code, ConnectError } from '@connectrpc/connect';

export function ChatRoom() {
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isJoined) return;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setIsConnected(true);

    const stream: AsyncIterable<ChatMessage> = chatClient.subscribe(
      { user: username },
      { signal: abortController.signal }
    );

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
  }, [isJoined, username]);

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

  const handleJoin = (e: FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsJoined(true);
    };
  };

  const handleLeave = () => {
    abortControllerRef.current?.abort();
    setIsJoined(false);
    setMessages([]);
  };

  if (!isJoined) {
    return (
      <div className="bg-white border border-slate-200 p-6 max-w-sm">
        <h2 className="font-medium text-slate-800">チャットに参加</h2>
        <p className="text-slate-500 text-sm mt-1">ユーザー名を入力してください</p>
        <form onSubmit={handleJoin} className="mt-4 space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザー名"
            className="w-full px-3 py-2 border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-slate-800 text-white py-2 hover:bg-slate-700"
          >
            参加する
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="h-[480px] flex flex-col bg-white border border-slate-200">
      <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">
            <span className="font-medium text-slate-800">{username}</span>
          </span>
          <button
            onClick={handleLeave}
            className="px-2 py-1 text-xs text-slate-600 hover:text-slate-800 border border-slate-300 hover:border-slate-400"
          >
            退室
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-slate-300'}`}
          />
          <span className="text-xs text-slate-500">
            {isConnected ? '接続中' : '切断'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-slate-400">メッセージはまだありません</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            if (msg.type === MessageType.JOIN || msg.type === MessageType.LEAVE) {
              return (
                <div key={index} className="flex justify-center">
                  <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs rounded-full">
                    {msg.user} さんが{msg.type === MessageType.JOIN ? '入室' : '退室'}しました
                  </span>
                </div>
              );
            }

            const isOwn = msg.user === username;
            return (
              <div key={index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg ${isOwn ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
                  <p className={`text-xs mb-0.5 ${isOwn ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isOwn ? '' : msg.user}
                  </p>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 px-3 py-2 border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
        />
        <button
          type="submit"
          className="bg-slate-800 text-white px-4 py-2 hover:bg-slate-700 text-sm"
        >
          送信
        </button>
      </form>
    </div>
  );
}
