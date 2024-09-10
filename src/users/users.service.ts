import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { awsConfig } from '../config/aws.config';

@Injectable()
export class UsersService {
  private sqsClient: SQSClient;

  constructor(private prisma: PrismaService) {
    this.sqsClient = new SQSClient({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      },
    });
  }

  async register(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    await this.sendUserCreatedEvent(user);

    return user;
  }

  private async sendUserCreatedEvent(user: any) {
    const params = {
      QueueUrl: awsConfig.queueUrl,
      MessageBody: JSON.stringify({
        event: 'user.created',
        data: {
          id: user.id,
          email: user.email,
        },
      }),
    };

    try {
      const command = new SendMessageCommand(params);
      await this.sqsClient.send(command);
      console.log('Event sent to SQS:', params.MessageBody);
    } catch (error) {
      console.error('Error sending event to SQS:', error);
    }
  }
}
