import { envConstant } from '@constants/index';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: envConstant.JWT_SECRET_KEY,
    });
  }

  async validate(payload: any) {
    // Payload contains the decoded JWT data
    return payload;
  }
}
