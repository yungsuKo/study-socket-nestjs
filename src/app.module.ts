import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { EventsModule } from './events/events.module';
import { ChatsModule } from './apis/chats/chats.module';

@Module({
  // imports: [EventsModule],
  controllers: [AppController],
  providers: [AppService],
  imports: [ChatsModule],
})
export class AppModule {}
