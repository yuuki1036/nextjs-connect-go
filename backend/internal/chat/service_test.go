package chat

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"connectrpc.com/connect"
	chatv1 "github.com/yuuki1036/nextjs-connect-go/backend/gen/chat/v1"
	"github.com/yuuki1036/nextjs-connect-go/backend/gen/chat/v1/chatv1connect"
)

func TestService_SendMessage(t *testing.T) {
	svc := NewService()
	ch := svc.broker.Subscribe()
	defer svc.broker.Unsubscribe(ch)

	res, err := svc.SendMessage(context.Background(), connect.NewRequest(&chatv1.SendMessageRequest{
		User:    "alice",
		Content: "こんにちは",
	}))
	if err != nil {
		t.Fatalf("SendMessage: %v", err)
	}
	msg := res.Msg.Message
	if msg.Id != "msg-1" || msg.User != "alice" || msg.Content != "こんにちは" {
		t.Errorf("Message = {%q, %q, %q}, want {%q, %q, %q}", msg.Id, msg.User, msg.Content, "msg-1", "alice", "こんにちは")
	}
	if msg.Type != chatv1.MessageType_MESSAGE_TYPE_MESSAGE {
		t.Errorf("Type = %v, want MESSAGE_TYPE_MESSAGE", msg.Type)
	}
	if msg.Timestamp == nil {
		t.Error("Timestamp が設定されていない")
	}

	select {
	case got := <-ch:
		if got.Id != msg.Id {
			t.Errorf("broker に届いた Id = %q, want %q", got.Id, msg.Id)
		}
	default:
		t.Error("broker にメッセージが届いていない")
	}
}

// Subscribe はサーバーストリーミングなので、httptest のサーバー越しに client から呼ぶ
func TestService_Subscribe(t *testing.T) {
	svc := NewService()
	mux := http.NewServeMux()
	mux.Handle(chatv1connect.NewChatServiceHandler(svc))
	srv := httptest.NewServer(mux)
	defer srv.Close()

	client := chatv1connect.NewChatServiceClient(srv.Client(), srv.URL)

	// 様子見用の購読者で、alice の LEAVE が Publish されるのを待つ
	observer := svc.broker.Subscribe()
	defer svc.broker.Unsubscribe(observer)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	subCtx, unsubscribe := context.WithCancel(ctx)
	stream, err := client.Subscribe(subCtx, connect.NewRequest(&chatv1.SubscribeRequest{User: "alice"}))
	if err != nil {
		t.Fatalf("Subscribe: %v", err)
	}
	defer stream.Close()

	// 1 通目は自分の JOIN
	if !stream.Receive() {
		t.Fatalf("JOIN を受け取れない: %v", stream.Err())
	}
	if got := stream.Msg(); got.Type != chatv1.MessageType_MESSAGE_TYPE_JOIN || got.User != "alice" {
		t.Fatalf("1 通目 = {%v, %q}, want {JOIN, %q}", got.Type, got.User, "alice")
	}

	// 送ったメッセージがストリームに流れる
	if _, err := client.SendMessage(ctx, connect.NewRequest(&chatv1.SendMessageRequest{
		User:    "bob",
		Content: "やあ",
	})); err != nil {
		t.Fatalf("SendMessage: %v", err)
	}
	if !stream.Receive() {
		t.Fatalf("メッセージを受け取れない: %v", stream.Err())
	}
	if got := stream.Msg(); got.Type != chatv1.MessageType_MESSAGE_TYPE_MESSAGE || got.Content != "やあ" {
		t.Fatalf("2 通目 = {%v, %q}, want {MESSAGE, %q}", got.Type, got.Content, "やあ")
	}

	// 購読を切ると LEAVE が Publish される
	unsubscribe()
	for {
		select {
		case msg := <-observer:
			if msg.Type == chatv1.MessageType_MESSAGE_TYPE_LEAVE {
				if msg.User != "alice" {
					t.Errorf("LEAVE の User = %q, want %q", msg.User, "alice")
				}
				return
			}
		case <-ctx.Done():
			t.Fatal("LEAVE が Publish されない")
		}
	}
}
