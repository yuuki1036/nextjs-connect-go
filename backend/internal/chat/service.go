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
	broker    *Broker
	messageID atomic.Int64
}

func NewService() *Service {
	return &Service{
		broker: NewBroker(),
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
		Type:      chatv1.MessageType_MESSAGE_TYPE_MESSAGE,
	}

	s.broker.Publish(msg)

	return connect.NewResponse(&chatv1.SendMessageResponse{
		Message: msg,
	}), nil
}

func (s *Service) createSystemMessage(user string, msgType chatv1.MessageType) *chatv1.ChatMessage {
	return &chatv1.ChatMessage{
		Id:        fmt.Sprintf("sys-%d", s.messageID.Add(1)),
		User:      user,
		Timestamp: timestamppb.Now(),
		Type:      msgType,
	}
}

func (s *Service) Subscribe(
	ctx context.Context,
	req *connect.Request[chatv1.SubscribeRequest],
	stream *connect.ServerStream[chatv1.ChatMessage],
) error {
	user := req.Msg.User
	msgCh := s.broker.Subscribe()
	defer s.broker.Unsubscribe(msgCh)

	joinMsg := s.createSystemMessage(user, chatv1.MessageType_MESSAGE_TYPE_JOIN)
	s.broker.Publish(joinMsg)

	for {
		select {
		case <-ctx.Done():
			leaveMsg := s.createSystemMessage(user, chatv1.MessageType_MESSAGE_TYPE_LEAVE)
			s.broker.Publish(leaveMsg)
			return nil
		case msg := <-msgCh:
			if err := stream.Send(msg); err != nil {
				return err
			}
		}
	}
}
