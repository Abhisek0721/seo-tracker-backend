import { Module } from '@nestjs/common';
import { ApiUtilsService } from '@utils/utils.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DomainTrackController } from './controllers/domainTrack.controller';
import { DomainTrackService } from './services/domainTrack.service';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { DomainTrackConsumer } from './services/domainTrack.process';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'domain-track',
    }),
    HttpModule,
  ],
  controllers: [DomainTrackController],
  providers: [
    DomainTrackService,
    DomainTrackConsumer,
    PrismaService,
    ApiUtilsService,
  ],
})
export class DomainTrackModule {}
