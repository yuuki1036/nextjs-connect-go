package chat

import (
	"sync"

	chatv1 "github.com/yuuki1036/nextjs-connect-go/backend/gen/chat/v1"
)

type Hub struct {
	mu          sync.RWMutex
	subscribers map[chan *chatv1.ChatMessage]struct{}
}

func NewHub() *Hub {
	return &Hub{
		subscribers: make(map[chan *chatv1.ChatMessage]struct{}),
	}
}

func (h *Hub) Subscribe() chan *chatv1.ChatMessage {
	ch := make(chan *chatv1.ChatMessage, 16)
	h.mu.Lock()
	h.subscribers[ch] = struct{}{}
	h.mu.Unlock()

	return ch
}

func (h *Hub) Unsubscribe(ch chan *chatv1.ChatMessage) {
	h.mu.Lock()
	delete(h.subscribers, ch)
	h.mu.Unlock()
	close(ch)
}

func (h *Hub) Broadcast(msg *chatv1.ChatMessage) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for ch := range h.subscribers {
		select {
		case ch <- msg:
		default:
		}
	}
}
