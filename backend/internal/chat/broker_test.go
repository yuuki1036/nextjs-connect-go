package chat

import (
	"testing"

	chatv1 "github.com/yuuki1036/nextjs-connect-go/backend/gen/chat/v1"
)

func TestBroker_PublishToAllSubscribers(t *testing.T) {
	b := NewBroker()
	ch1 := b.Subscribe()
	ch2 := b.Subscribe()
	defer b.Unsubscribe(ch1)
	defer b.Unsubscribe(ch2)

	msg := &chatv1.ChatMessage{Id: "msg-1", Content: "こんにちは"}
	b.Publish(msg)

	for i, ch := range []chan *chatv1.ChatMessage{ch1, ch2} {
		select {
		case got := <-ch:
			if got.Id != "msg-1" {
				t.Errorf("subscriber %d: Id = %q, want %q", i, got.Id, "msg-1")
			}
		default:
			t.Errorf("subscriber %d: メッセージが届いていない", i)
		}
	}
}

func TestBroker_UnsubscribeClosesChannel(t *testing.T) {
	b := NewBroker()
	ch := b.Subscribe()
	b.Unsubscribe(ch)

	if _, ok := <-ch; ok {
		t.Fatal("Unsubscribe 後のチャネルが閉じていない")
	}

	// 購読をやめたチャネルには送らない（閉じたチャネルへの送信で panic しない）
	b.Publish(&chatv1.ChatMessage{Id: "msg-1"})
}

func TestBroker_PublishDoesNotBlockWhenBufferIsFull(t *testing.T) {
	b := NewBroker()
	ch := b.Subscribe()
	defer b.Unsubscribe(ch)

	// バッファ（16）を超えて送っても Publish はブロックせず、溢れた分は捨てる
	for i := 0; i < cap(ch)+5; i++ {
		b.Publish(&chatv1.ChatMessage{})
	}
	if len(ch) != cap(ch) {
		t.Fatalf("len = %d, want %d", len(ch), cap(ch))
	}
}
