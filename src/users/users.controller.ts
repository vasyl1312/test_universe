import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { MetricsService } from '../metrics/metrics.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly metricsService: MetricsService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const end = this.metricsService.httpRequestDurationHistogram.startTimer();
    try {
      return await this.usersService.register(createUserDto);
    } finally {
      end({ method: 'POST', route: '/users/register' });
    }
  }
}
