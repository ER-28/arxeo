import { Module, Global } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { EmailProcessor } from './processors/email.processor';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('smtp.host'),
          port: config.get<number>('smtp.port'),
          secure: false,
          auth: config.get<string>('smtp.user')
            ? {
                user: config.get<string>('smtp.user'),
                pass: config.get<string>('smtp.pass'),
              }
            : undefined,
        },
        defaults: {
          from: config.get<string>('smtp.from'),
        },
      }),
    }),
    BullModule.registerQueue({ name: 'email' }),
  ],
  providers: [MailService, EmailProcessor],
  exports: [MailService],
})
export class MailModule {}
