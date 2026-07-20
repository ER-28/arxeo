import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);
  private readonly hibpApiKey: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.hibpApiKey = this.config.get<string>('hibp.apiKey');
  }

  async checkPasswordBreach(password: string): Promise<{
    breached: boolean;
    count: number;
  }> {
    const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = sha1.substring(0, 5);
    const suffix = sha1.substring(5);

    try {
      const headers: Record<string, string> = {
        'hibp-api-key': this.hibpApiKey || '',
        'user-agent': 'Arxeo-Password-Manager',
      };

      const response = await fetch(
        `https://api.pwnedpasswords.com/range/${prefix}`,
        { headers },
      );

      if (!response.ok) {
        this.logger.warn(`HIBP API returned ${response.status}`);
        return { breached: false, count: 0 };
      }

      const text = await response.text();
      const lines = text.split('\n');

      for (const line of lines) {
        const [hashSuffix, count] = line.split(':');
        if (hashSuffix.trim() === suffix) {
          return { breached: true, count: parseInt(count.trim(), 10) };
        }
      }

      return { breached: false, count: 0 };
    } catch (error: any) {
      this.logger.error(`HIBP check failed: ${error.message}`);
      return { breached: false, count: 0 };
    }
  }
}
