// src/config/google.config.ts
import * as dotenv from 'dotenv';
import { validateEnv } from '../core/utils/env.utils';
import appConfig from './app.config';

// Dynamically load the configuration based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

/**
 * Google configuration including OAuth2 and Gmail API settings.
 * Required environment variables:
 * - GOOGLE_CLIENT_ID: Google OAuth2 client ID
 * - GOOGLE_CLIENT_SECRET: Google OAuth2 client secret
 * - GOOGLE_CALLBACK_URL: OAuth2 callback URL
 * - GMAIL_USER: Gmail address used for sending emails
 * - GMAIL_REFRESH_TOKEN: OAuth2 refresh token for Gmail API
 * - GMAIL_ACCESS_TOKEN: OAuth2 access token for Gmail API (optional, will be refreshed automatically)
 */
export default () => {
    const appConfiguration = appConfig();

    return {
        google: {
            clientId: String(validateEnv('GOOGLE_CLIENT_ID')),
            clientSecret: String(validateEnv('GOOGLE_CLIENT_SECRET')),
            redirectUri: appConfiguration.app.frontendLink,
            playgroundRedirectUri: nodeEnv === 'development' 
                ? 'http://localhost:8080/api/auth/google/playground'
                : 'https://dead-ellynn-vzharyi-27c1ff99.koyeb.app/api/auth/google/playground',
            callbackUrl: String(validateEnv('GOOGLE_CALLBACK_URL')),
            gmailApi: {
                user: String(validateEnv('GMAIL_USER')),
                clientId: String(validateEnv('GOOGLE_CLIENT_ID')),
                clientSecret: String(validateEnv('GOOGLE_CLIENT_SECRET')),
                refreshToken: String(validateEnv('GMAIL_REFRESH_TOKEN')),
                accessToken: String(validateEnv('GMAIL_ACCESS_TOKEN')),
            },
        },
    };
};
