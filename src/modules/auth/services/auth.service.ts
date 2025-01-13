import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from '../dto/signup.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(data: SignUpDto) {
    try {
      const existingUser = await this.prisma.user.count({
        where: { email: data.email?.toLowerCase() },
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const createdUser = await this.prisma.user.create({
        data: {
          fullName: data.fullName,
          email: data.email?.toLowerCase(),
          password: hashedPassword,
        },
      });

      const payload = {
        userId: createdUser.id,
        fullName: createdUser.fullName,
        email: createdUser.email,
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: payload,
      };
    } catch (error) {
      if (error.statusCode === 500) {
        Logger.error(error?.stack);
      }
      throw error;
    }
  }

  async login({ email, password }: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new BadRequestException('Invalid email or password');
      }

      const payload = {
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: payload,
      };
    } catch (error) {
      if (error.statusCode === 500) {
        Logger.error(error?.stack);
      }
      throw error;
    }
  }

  async googleLogin({
    fullName,
    email,
  }: {
    fullName: string;
    email: string;
  }) {
    try {
      let user = await this.prisma.user.findFirst({
        where: { email: email?.toLowerCase() },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            fullName,
            email: email?.toLowerCase(),
            verified: true,
          },
        });
      }

      const payload = {
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: payload,
      };
    } catch (error) {
      if (error.statusCode === 500) {
        Logger.error(error?.stack);
      }
      throw error;
    }
  }
}
