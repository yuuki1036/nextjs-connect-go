import { ChatRoom } from '../components/ChatRoom';

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Chat App</h1>
      </div>
      <ChatRoom />
    </div>
  );
}
