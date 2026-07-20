import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export interface GeneratePasswordDto {
  length?: number;
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
  excludeAmbiguous?: boolean;
}

@Injectable()
export class ToolsService {
  generatePassword(options: GeneratePasswordDto = {}): {
    password: string;
    entropy: number;
  } {
    const {
      length = 16,
      uppercase = true,
      lowercase = true,
      numbers = true,
      symbols = true,
      excludeAmbiguous = false,
    } = options;

    let chars = '';
    if (uppercase) chars += excludeAmbiguous ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowercase) chars += excludeAmbiguous ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) chars += excludeAmbiguous ? '23456789' : '0123456789';
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

    const password = Array.from(crypto.randomBytes(length))
      .map((byte) => chars[byte % chars.length])
      .join('');

    const entropy = Math.floor(Math.log2(chars.length) * length);

    return { password, entropy };
  }
}
