import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { ApiUtilsService } from '@utils/utils.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService, ApiUtilsService],
})
export class UserModule {}
