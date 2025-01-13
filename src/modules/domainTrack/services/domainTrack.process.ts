import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DomainTrackService } from './domainTrack.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
@Processor('domain-track')
export class DomainTrackConsumer {
  constructor(
    private readonly prisma: PrismaService,
    private readonly domainTrackService: DomainTrackService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Process('process-domain')
  async handleDomainTrack(job: Job<{ domainTrackId: string; userId: string }>) {
    const { domainTrackId, userId } = job.data;
    try {
      Logger.log(`Processing domainTrackId: ${domainTrackId}:${userId}`);

      const domainTrack = await this.prisma.domainTrack.findUnique({
        where: { id: domainTrackId },
        select: {
          id: true,
          dataforseo_taskId: true,
        },
      });

      if (!domainTrack) {
        throw new Error(`DomainTrack with ID ${domainTrackId} not found`);
      }

      await this.domainTrackService.updateDomainMetrices(
        domainTrack.dataforseo_taskId,
        domainTrack.id,
      );
      const cacheKey = `domain-metrics:${domainTrackId}:${userId}`;
      const domainMatrices = await this.prisma.domainTrack.findUnique({
        where: {
          id: domainTrackId,
          userId: userId,
        },
        include: {
          DomainInfo: true,
        },
      });
      await this.cacheManager.set(cacheKey, domainMatrices, 10 * 60 * 1000);
      // Example operation
      Logger.log(
        `Successfully processed domainTrack: ${JSON.stringify(domainTrack)}`,
      );
    } catch (error) {
      Logger.error(
        `Failed to process domainTrackId: ${domainTrackId}`,
        error.stack,
      );
    }
  }
}
