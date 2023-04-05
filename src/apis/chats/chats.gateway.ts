import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatsGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket, roomId: string) {
    client.join(roomId);
    // 브라우저랑 통신이 끊기더라도 ? 혹은 브라우저와 통신이 끊긴 이후에 다시 돌아오더라도. room에 유지
  }

  @SubscribeMessage('createRoom')
  async createRoom(socket: Socket, data: string) {
    await socket.join('aRoom');
    console.log(data);
    socket.to('aRoom').emit('roomCreated', { room: 'aRoom' });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
  // 1. 상품별로 room을 만들어야 할 듯.
  // 2. 브라우저 접속 끊겼을 때도 room에 유지되어야 함.
  // 2-1. 브라우저에 있을 때는 알림을 브라우저로 보냄
  // 2-2. 브라우저에 없을 때는 알림을 이메일로 보냄
  @SubscribeMessage('message')
  handleEvent(client: Socket, payload: any) {
    console.log(client.rooms);
    console.log(`Client ${client.id} sent a message: ${payload}`);
    this.server.emit('message', payload);
  }

  @SubscribeMessage('enterChatRoomA')
  enterChatRoomA(client: Socket, roomId: string) {
    client.join(roomId);
    this.server.emit('message', 'enterChatRoomA');
  }
}
