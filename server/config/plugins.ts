import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'localhost'),
        port: env.int('SMTP_PORT', 2525),
        auth: {
          user: env('SMTP_USER'),
          pass: env('SMTP_PASS'),
        },
        secure: env.bool('SMTP_SECURE', false), // False for 2525
        tls: {
          rejectUnauthorized: env.bool('SMTP_TLS_REJECT_UNAUTHORIZED', false),
        },
      },
      settings: {
        defaultFrom: env('SMTP_FROM', 'system@straplearn.org'),
        defaultReplyTo: env('SMTP_REPLY_TO', 'support@straplearn.org'),
      },
    },
  },
});

export default config;
