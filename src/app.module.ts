import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [MetricsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
