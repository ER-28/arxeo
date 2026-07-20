import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export interface EmailJob {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

@Processor('email', { concurrency: 5 })
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async process(job: Job<EmailJob>): Promise<void> {
    const { to, subject, html, text } = job.data;
    const from = this.config.get<string>('smtp.from')!;

    try {
      await this.mailer.sendMail({ from, to, subject, html, text });
      this.logger.log(`Email sent to ${to} (job ${job.id})`);
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }
}
