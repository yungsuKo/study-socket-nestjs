import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: 'chats' })
export class ChatsGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('ChatGateway');

  afterInit(server: any) {
    this.logger.log('Initialized!');
  }

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('new-room')
  handleNewRoom(client: Socket, roomName: string) {
    client.emit('create-room', roomName);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, { text, roomName }) {
    console.log('connected', client.id);
    const userName = client.data.userName;
    client.to(roomName).emit('message', { text, userName });
  }

  @SubscribeMessage('join-room')
  handleRoomJoin(client: Socket, { userName, roomName }) {
    console.log('join room', roomName, userName);
    client.join(roomName);
    client.data.roomId = roomName;
    client.data.userName = userName;
    // client.emit('join-room-success', roomName);
  }

  @SubscribeMessage('leave-room')
  handleRoomLeave(client: Socket, roomName: string) {
    client.leave(roomName);
    client.emit('leftRoom', roomName);
  }
}
