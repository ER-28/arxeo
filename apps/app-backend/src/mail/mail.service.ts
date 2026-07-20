import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailJob } from './processors/email.processor';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly from: string;

  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {
    this.from = this.config.get<string>('smtp.from')!;
  }

  async sendMail(options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }): Promise<void> {
    const jobData: EmailJob = {
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    try {
      await this.emailQueue.add('send', jobData, {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      });
      this.logger.log(`Email queued for ${options.to}`);
    } catch (error: any) {
      this.logger.error(`Failed to queue email for ${options.to}: ${error.message}`);
      throw error;
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const frontendUrl = this.config.get<string>('frontendUrl');
    await this.sendMail({
      to,
      subject: 'Verify your Arxeo account',
      html: `
        <h1>Welcome to Arxeo</h1>
        <p>Click the link below to verify your email address:</p>
        <a href="${frontendUrl}/auth/verify?token=${token}">
          Verify Email
        </a>
        <p>This link expires in 24 hours.</p>
      `,
    });
  }

  async sendPasswordReset(to: string, token: string): Promise<void> {
    const frontendUrl = this.config.get<string>('frontendUrl');
    await this.sendMail({
      to,
      subject: 'Reset your Arxeo password',
      html: `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${frontendUrl}/auth/reset-password?token=${token}">
          Reset Password
        </a>
        <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      `,
    });
  }

  async sendInvite(
    to: string,
    inviterName: string,
    orgName: string,
  ): Promise<void> {
    const frontendUrl = this.config.get<string>('frontendUrl');
    await this.sendMail({
      to,
      subject: `You've been invited to ${orgName} on Arxeo`,
      html: `
        <h1>You've been invited!</h1>
        <p><strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> on Arxeo.</p>
        <a href="${frontendUrl}/auth/accept-invite?email=${encodeURIComponent(to)}">
          Accept Invitation
        </a>
      `,
    });
  }
}
