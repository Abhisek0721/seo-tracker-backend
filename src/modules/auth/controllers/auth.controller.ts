import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiResponseT } from '@utils/types';
import { ApiUtilsService } from '@utils/utils.service';
import { AuthService } from '../services/auth.service';
import { SignUpDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { envConstant } from '@constants/index';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly apiUtilsSevice: ApiUtilsService,
  ) {}

  @Post('signup')
  async signup(@Body() signupDto: SignUpDto): Promise<ApiResponseT> {
    const data = await this.authService.signup(signupDto);
    return this.apiUtilsSevice.make_response(data);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ApiResponseT> {
    const data = await this.authService.login(loginDto);
    return this.apiUtilsSevice.make_response(data);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Initiates Google OAuth login flow
  }

  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginRedirect(@Req() req: any, @Res() res: Response) {
    const data = await this.authService.googleLogin(req.user);
    const redirectUrl = `chrome-extension://${envConstant.BASE_URL}/google-login-success?token=${data.access_token}&user=${JSON.stringify(data.user)}`;
    return res.redirect(redirectUrl);
  }
}
