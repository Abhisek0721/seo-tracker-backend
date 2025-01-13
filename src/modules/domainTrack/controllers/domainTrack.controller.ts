import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiResponseT } from '@utils/types';
import { ApiUtilsService } from '@utils/utils.service';
import JwtAuthGuard from '@modules/auth/guards/jwt-auth.guard';
import { GetUser } from '@common/decorators/user.decorator';
import { JwtDto } from 'src/common/dto/jwt.dto';
import { DomainTrackService } from '../services/domainTrack.service';
import { AddDomainDto } from '../dto/addDomain.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('domain-track')
@UseGuards(JwtAuthGuard)
export class DomainTrackController {
  constructor(
    private readonly domainTrackService: DomainTrackService,
    private readonly apiUtilsSevice: ApiUtilsService,
  ) {}

  @Post('add-domain')
  async addDomain(
    @Body() dto: AddDomainDto,
    @GetUser() user: JwtDto,
  ): Promise<ApiResponseT> {
    const data = await this.domainTrackService.addDomain(dto, user);
    return this.apiUtilsSevice.make_response(
      data,
      `${data.domainName} is added!`,
    );
  }

  @Get('domain-list')
  async getDomainsList(
    @Query() paginationDto: PaginationDto,
    @GetUser() user: JwtDto,
  ): Promise<ApiResponseT> {
    const data = await this.domainTrackService.domainList(paginationDto, user);
    return this.apiUtilsSevice.make_response(data);
  }

  @Get('domain-metrices/:domainTrackId')
  async getDomainMetrices(
    @Param('domainTrackId') domainTrackId: string,
    @GetUser() user: JwtDto,
  ): Promise<ApiResponseT> {
    const data = await this.domainTrackService.getDomainMetrices(domainTrackId, user);
    return this.apiUtilsSevice.make_response(data);
  }
}
