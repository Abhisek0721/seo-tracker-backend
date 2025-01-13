import { JwtDto } from 'src/common/dto/jwt.dto';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddDomainDto } from '../dto/addDomain.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { envConstant } from '@constants/index';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class DomainTrackService {
  constructor(
    private readonly prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async addDomain(dto: AddDomainDto, user: JwtDto) {
    try {
      const apiUrl = `${envConstant.DATAFORSEO_BASE_URL}/on_page/task_post`;
      const payload = [
        {
          target: dto.domainName,
          max_crawl_pages: dto.max_crawl_pages ?? 10,
        },
      ];

      const response = await lastValueFrom(
        this.httpService.post(apiUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${envConstant.DATAFORSEO_AUTH_KEY}`,
          },
        }),
      );

      const taskId = response.data?.tasks?.[0]?.id;
      if (!taskId) {
        throw new Error('Task creation failed: No task ID returned');
      }
      const domainTrack = await this.prisma.domainTrack.create({
        data: {
          domainName: dto.domainName,
          dataforseo_taskId: taskId,
          userId: user.userId,
          DomainInfo: {
            create: {},
          },
        },
      });

      return domainTrack;
    } catch (error) {
      if (error.statusCode === 500) {
        Logger.error(error?.stack);
      }
      throw error;
    }
  }

  async domainList(paginationDto: PaginationDto, user: JwtDto) {
    try {
      if (!paginationDto.limit) {
        paginationDto.limit = 10;
      }

      if (!paginationDto.pageNumber) {
        paginationDto.pageNumber = 1;
      }

      const domains = await this.prisma.domainTrack.findMany({
        where: {
          userId: user.userId,
        },
        select: {
          id: true,
          dataforseo_taskId: true,
          domainName: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: paginationDto.limit * paginationDto.pageNumber,
        take: paginationDto.pageNumber,
      });

      const domainCount = await this.prisma.domainTrack.count({
        where: {
          userId: user.userId,
        },
      });

      return {
        domains,
        domainCount,
      };
    } catch (error) {
      if (error.statusCode === 500) {
        Logger.error(error?.stack);
      }
      throw error;
    }
  }
}
