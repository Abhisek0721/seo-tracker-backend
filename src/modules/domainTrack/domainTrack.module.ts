import { Module } from '@nestjs/common';
import { ApiUtilsService } from '@utils/utils.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DomainTrackController } from './controllers/domainTrack.controller';
import { DomainTrackService } from './services/domainTrack.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [DomainTrackController],
  providers: [DomainTrackService, PrismaService, ApiUtilsService],
})
export class DomainTrackModule {}
