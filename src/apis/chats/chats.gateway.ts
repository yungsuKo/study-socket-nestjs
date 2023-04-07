import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
// implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
export class ChatsGateway {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, string>();
  private readonly rooms = new Map<string, Set<Socket>>();

  // afterInit(server: Server) {
  //   console.log('Socket initialized');
  // }

  // // 소켓 연결이 성공했을 때 실행되는 메서드
  // handleConnection(client: Socket, ...args: any[]) {
  //   console.log(`Client connected: ${client.id}`);
  // }

  // handleDisconnect(client: Socket) {
  //   console.log(`Client disconnected: ${client.id}`);
  //   this.connectedClients.delete(client.id);
  // }

  @SubscribeMessage('new-room')
  async createRoom(client: any, roomName: string): Promise<string> {
    this.rooms.set(roomName, new Set<Socket>([client]));
    client.emit('create-room', roomName);
    return roomName;
  }
  // 방에 입장할 때 실행되는 메서드
  @SubscribeMessage('join')
  handleJoinRoom(
    client: Socket,
    payload: { roomName: string; username: string },
  ) {
    console.log('join', payload);
    const { roomName, username } = payload;

    client.join(roomName); // 방에 클라이언트를 추가
    this.connectedClients.set(client.id, roomName); // 클라이언트가 속한 방 정보를 저장

    const clientsInRoom = this.server.sockets.adapter.rooms.get(roomName); // 방에 속한 클라이언트 리스트 가져오기
    const usernamesInRoom = Array.from(clientsInRoom).map((clientId) => {
      return this.connectedClients.get(clientId);
    });

    client.emit('joinRoom', usernamesInRoom); // 클라이언트에게 방에 입장했다는 이벤트 전송
    client.to(roomName).emit('userJoined', username); // 다른 클라이언트에게 새로운 클라이언트가 입장했다는 이벤트 전송
  }

  @SubscribeMessage('join-room')
  handleJoinsRoom(client: Socket, roomName: string) {
    client.join(roomName);
    client.emit('join-room-success', roomName);
    return roomName;
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
