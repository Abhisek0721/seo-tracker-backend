import { JwtDto } from 'src/common/dto/jwt.dto';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(user: JwtDto) {
    try {
      const userProfile = await this.prisma.user.findUniqueOrThrow({
        where: {
          id: user.userId,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              domainTrack: true,
            },
          },
        },
      });

      return userProfile;
    } catch (error) {
      if (error.statusCode === 500) {
        Logger.error(error?.stack);
      }
      throw error;
    }
  }
}
