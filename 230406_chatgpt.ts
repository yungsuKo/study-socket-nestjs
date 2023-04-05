import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private connectedClients = new Map<string, string>();

  // 소켓이 초기화될 때 실행되는 메서드
  afterInit(server: Server) {
    console.log('Socket initialized');
  }

  // 소켓 연결이 성공했을 때 실행되는 메서드
  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  // 소켓 연결이 끊겼을 때 실행되는 메서드
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  // 방에 입장할 때 실행되는 메서드
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    client: Socket,
    payload: { roomName: string; username: string },
  ) {
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

  // 방에서 나갈 때 실행되는 메서드
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    client: Socket,
    payload: { roomName: string; username: string },
  ) {
    const { roomName, username } = payload;

    client.leave(roomName); // 방에서 클라이언트를 제거
    this.connectedClients.delete(client.id); // 클라이언트 정보 삭제

    client.emit('leaveRoom'); // 클라이언트에게 방에서 나갔다는 이벤트 전송
    client.to(roomName).emit('userLeft', username); // 다른 클라이언트에게 클라이언트가 방에서 나갔다는 이벤트 전송
  }

  // 클라이언트가 메시지를 보낼 때 실행되는 메서드
  @SubscribeMessage('sendMessage')
  handleMessage(
    client: Socket,
    payload: { roomName: string; username: string; message: string },
  ) {
    const { roomName, username, message } = payload;

    client.to(roomName).emit('message', { username, message });
    // 다른 클라이언트에 메시지를 전송
  }
}

// 위 예시 코드에서는 `ChatGateway`라는 WebSocketGateway를 생성하고, `OnGatewayInit`, `OnGatewayConnection`, `OnGatewayDisconnect` 인터페이스를 상속받아 소켓의 초기화, 연결, 연결 해제 이벤트를 처리하고 있습니다.

// `handleJoinRoom` 메서드에서는 `joinRoom`이라는 이벤트를 구독하고, 클라이언트가 속한 방 정보를 `connectedClients` 맵에 저장합니다. 이후 해당 방에 속한 클라이언트 리스트를 가져와서 방에 입장한 클라이언트에게 전송하고, 다른 클라이언트에게 새로운 클라이언트가 입장했다는 이벤트를 전송합니다.

// `handleLeaveRoom` 메서드에서는 `leaveRoom`이라는 이벤트를 구독하고, 클라이언트가 방에서 나간 경우 방 정보를 `connectedClients` 맵에서 삭제합니다. 이후 클라이언트가 방에서 나갔다는 이벤트를 전송하고, 다른 클라이언트에게 클라이언트가 방에서 나갔다는 이벤트를 전송합니다.

// `handleMessage` 메서드에서는 `sendMessage`라는 이벤트를 구독하고, 클라이언트가 보낸 메시지를 해당 방에 속한 다른 클라이언트에게 전송합니다.

// 이처럼 Socket.io를 사용하여 방을 생성하고 통신하는 기능은 `@nestjs/websockets` 패키지에서 제공하는 `WebSocketGateway` 데코레이터를 이용하여 구현할 수 있습니다. 위 예시 코드를 참고하여 NestJS 프로젝트에서 Socket.io를 사용하여 방을 생성하고 통신하는 기능을 구현해보세요!
