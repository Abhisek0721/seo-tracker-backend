import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { envConstant } from '@constants/index';
import { ApiUtilsService } from '@utils/utils.service';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtStrategy } from './services/jwt.strategy';
import { GoogleStrategy } from './services/google.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: envConstant.JWT_SECRET_KEY,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    JwtStrategy,
    GoogleStrategy,
    ApiUtilsService,
    AuthService,
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
