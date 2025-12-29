import { ChatRoom } from '../components/ChatRoom';

export default function ChatPage() {
  return (
    <div className="max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Chat App
      </h1>
      <ChatRoom />
    </div>
  );
}
