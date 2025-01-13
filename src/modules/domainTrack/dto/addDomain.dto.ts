import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class AddDomainDto {
  @IsNotEmpty()
  @IsString()
  domainName: string;

  @IsNotEmpty()
  @IsInt()
  max_crawl_pages: number;
}
