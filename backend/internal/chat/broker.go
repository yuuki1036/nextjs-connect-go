package chat

import (
	"sync"

	chatv1 "github.com/yuuki1036/nextjs-connect-go/backend/gen/chat/v1"
)

type Broker struct {
	mu          sync.RWMutex
	subscribers map[chan *chatv1.ChatMessage]struct{}
}

func NewBroker() *Broker {
	return &Broker{
		subscribers: make(map[chan *chatv1.ChatMessage]struct{}),
	}
}

func (b *Broker) Subscribe() chan *chatv1.ChatMessage {
	ch := make(chan *chatv1.ChatMessage, 16)
	b.mu.Lock()
	b.subscribers[ch] = struct{}{}
	b.mu.Unlock()

	return ch
}

func (b *Broker) Unsubscribe(ch chan *chatv1.ChatMessage) {
	b.mu.Lock()
	delete(b.subscribers, ch)
	b.mu.Unlock()
	close(ch)
}

func (b *Broker) Broadcast(msg *chatv1.ChatMessage) {
	b.mu.RLock()
	defer b.mu.RUnlock()

	for ch := range b.subscribers {
		select {
		case ch <- msg:
		default:
		}
	}
}
