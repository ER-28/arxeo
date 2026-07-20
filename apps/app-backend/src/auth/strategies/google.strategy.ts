import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(config: ConfigService) {
    const clientId = config.get<string>('google.clientId');
    if (!clientId) {
      super({
        clientID: 'placeholder',
        clientSecret: 'placeholder',
        callbackURL: 'http://localhost:4000/v1/auth/google/callback',
        scope: ['email', 'profile'],
        passReqToCallback: false,
      } as any);
      this.logger.warn('Google OAuth not configured — GOOGLE_CLIENT_ID is missing');
      return;
    }
    super({
      clientID: clientId,
      clientSecret: config.get<string>('google.clientSecret') || '',
      callbackURL: config.get<string>('google.callbackUrl')!,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, emails, displayName, photos } = profile;
    done(null, {
      googleId: id,
      email: emails?.[0]?.value,
      displayName,
      avatar: photos?.[0]?.value,
      accessToken,
    });
  }
}
