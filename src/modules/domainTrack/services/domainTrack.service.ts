import { JwtDto } from 'src/common/dto/jwt.dto';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddDomainDto } from '../dto/addDomain.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { envConstant } from '@constants/index';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class DomainTrackService {
  constructor(
    private readonly prisma: PrismaService,
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectQueue('domain-track') private readonly domainTrackQueue: Queue,
  ) {}

  async addDomain(dto: AddDomainDto, user: JwtDto) {
    try {
      const checkDomain = await this.prisma.domainTrack.count({
        where: {
          domainName: dto.domainName,
          userId: user.userId
        },
      });
      if (checkDomain) {
        throw new BadRequestException(`${dto.domainName} is already added`);
      }
      const apiUrl = `${envConstant.DATAFORSEO_BASE_URL}/on_page/task_post`;
      const payload = [
        {
          target: dto.domainName,
          max_crawl_pages: dto.maxCrawlPages ?? 10,
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

      await this.domainTrackQueue.add(
        'process-domain',
        { domainTrackId: domainTrack.id, userId: user.userId },
        { delay: 20000 }, // consume after 20sec delay
      );

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
          DomainInfo: {
            select: {
              crawl_progress: true,
              ip: true,
              server: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: paginationDto.limit * (paginationDto.pageNumber - 1),
        take: paginationDto.limit,
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

  async updateDomainMetrices(dataforseo_taskId: string, domainTrackId: string) {
    try {
      const apiUrl = `${envConstant.DATAFORSEO_BASE_URL}/on_page/summary/${dataforseo_taskId}`;

      const response = await lastValueFrom(
        this.httpService.get(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${envConstant.DATAFORSEO_AUTH_KEY}`,
          },
        }),
      );

      const tasks = response.data?.tasks?.[0];
      if (!tasks || !tasks.result) {
        throw new Error('Invalid tasks data or result not found');
      }

      const domainInfo = tasks.result?.[0]?.domain_info || {};
      const pageMetrics = tasks.result?.[0]?.page_metrics || {};
      const checks = pageMetrics?.checks || {};
      const sslInfo = domainInfo?.ssl_info || {};

      await this.prisma.domainInfo.update({
        where: {
          domainTrackId,
        },
        data: {
          crawl_progress: tasks.result?.[0]?.crawl_progress || null,
          total_pages: domainInfo.total_pages || 0,
          ip: domainInfo.ip || null,
          server: domainInfo.server || null,
          ssl: domainInfo.checks?.ssl || false,
          ssl_certificate_expiration_date:
            new Date(sslInfo.certificate_expiration_date) || null,
          links_external: pageMetrics.links_external || 0,
          links_internal: pageMetrics.links_internal || 0,
          duplicate_title: pageMetrics.duplicate_title || 0,
          duplicate_description: pageMetrics.duplicate_description || 0,
          duplicate_content: pageMetrics.duplicate_content || 0,
          broken_links: pageMetrics.broken_links || 0,
          duplicate_meta_tags: checks.duplicate_meta_tags || 0,
          no_description: checks.no_description || 0,
          seo_friendly_url: checks.seo_friendly_url || 0,
          seo_friendly_url_characters_check:
            checks.seo_friendly_url_characters_check || 0,
          seo_friendly_url_dynamic_check:
            checks.seo_friendly_url_dynamic_check || 0,
          seo_friendly_url_keywords_check:
            checks.seo_friendly_url_keywords_check || 0,
          seo_friendly_url_relative_length_check:
            checks.seo_friendly_url_relative_length_check || 0,
        },
      });
    } catch (error) {
      if (error.statusCode === 500) {
        Logger.error(error?.stack);
      }
      throw error;
    }
  }

  async getDomainMetrices(domainTrackId: string, user: JwtDto) {
    try {
      const cacheKey = `domain-metrics:${domainTrackId}:${user.userId}`;
      let domainMatrices: any = await this.cacheManager.get(cacheKey);
      if (!domainMatrices) {
        // Fetch domainTrack data from the database
        const domainCheck = await this.prisma.domainTrack.findUnique({
          where: {
            id: domainTrackId,
            userId: user.userId,
          },
          select: {
            dataforseo_taskId: true,
          },
        });

        if (!domainCheck) {
          throw new NotFoundException('Invalid domainTrackId!');
        }

        // Update domain metrics
        await this.updateDomainMetrices(
          domainCheck.dataforseo_taskId,
          domainTrackId,
        );

        // Fetch updated domain metrics from the database
        domainMatrices = await this.prisma.domainTrack.findUnique({
          where: {
            id: domainTrackId,
            userId: user.userId,
          },
          include: {
            DomainInfo: true,
          },
        });

        if (!domainMatrices) {
          throw new NotFoundException('Domain metrics not found after update.');
        }

        await this.cacheManager.set(cacheKey, domainMatrices, 10 * 60 * 1000);
      }

      return domainMatrices;
    } catch (error) {
      if (error.statusCode === 500) {
        Logger.error(error?.stack);
      }
      throw error;
    }
  }
}
