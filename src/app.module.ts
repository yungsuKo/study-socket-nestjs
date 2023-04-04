import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from './app.gateway';
// import { EventsModule } from './events/events.module';

@Module({
  // imports: [EventsModule],
  controllers: [AppController],
  providers: [AppGateway, AppService],
})
export class AppModule {}
