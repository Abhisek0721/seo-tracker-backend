import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class JwtDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
