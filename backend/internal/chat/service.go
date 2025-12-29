package chat

import (
	"context"
	"fmt"
	"sync/atomic"

	"connectrpc.com/connect"
	chatv1 "github.com/yuuki1036/nextjs-connect-go/backend/gen/chat/v1"
	"github.com/yuuki1036/nextjs-connect-go/backend/gen/chat/v1/chatv1connect"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type Service struct {
	hub       *Hub
	messageID atomic.Int64
}

func NewService() *Service {
	return &Service{
		hub: NewHub(),
	}
}

var _ chatv1connect.ChatServiceHandler = (*Service)(nil)

func (s *Service) SendMessage(
	ctx context.Context,
	req *connect.Request[chatv1.SendMessageRequest],
) (*connect.Response[chatv1.SendMessageResponse], error) {
	msg := &chatv1.ChatMessage{
		Id:        fmt.Sprintf("msg-%d", s.messageID.Add(1)),
		User:      req.Msg.User,
		Content:   req.Msg.Content,
		Timestamp: timestamppb.Now(),
	}

	s.hub.Broadcast(msg)

	return connect.NewResponse(&chatv1.SendMessageResponse{
		Message: msg,
	}), nil
}

func (s *Service) Subscribe(
	ctx context.Context,
	req *connect.Request[chatv1.SubscribeRequest],
	stream *connect.ServerStream[chatv1.ChatMessage],
) error {
	msgCh := s.hub.Subscribe()
	defer s.hub.Unsubscribe(msgCh)

	fmt.Printf("👤 Client subscribed: %s\n", req.Msg.User)

	for {
		select {
		case <-ctx.Done():
			fmt.Printf("👋 Client disconnected: %s\n", req.Msg.User)
			return nil
		case msg := <-msgCh:
			if err := stream.Send(msg); err != nil {
				return err
			}
		}
	}
}
