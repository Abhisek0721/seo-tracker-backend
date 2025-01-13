import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { BullModule } from '@nestjs/bull';
import { ApiUtilsService } from '@utils/utils.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'user-verification',
    }),
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService, ApiUtilsService],
})
export class UserModule {}
