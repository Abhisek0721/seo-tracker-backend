import { Module } from '@nestjs/common';
import { ApiUtilsService } from '@utils/utils.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DomainTrackController } from './controllers/domainTrack.controller';
import { DomainTrackService } from './services/domainTrack.service';

@Module({
  imports: [],
  controllers: [DomainTrackController],
  providers: [DomainTrackService, PrismaService, ApiUtilsService],
})
export class DomainTrackModule {}
