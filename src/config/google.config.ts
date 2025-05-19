// src/config/google.config.ts
import * as dotenv from 'dotenv';
import { validateEnv } from '../core/utils/env.utils';
import appConfig from './app.config';

dotenv.config({ path: '.env.development' });

export default () => {
    const appConfiguration = appConfig();

    return {
        google: {
            clientId: String(validateEnv('GOOGLE_CLIENT_ID')),
            clientSecret: String(validateEnv('GOOGLE_CLIENT_SECRET')),
            redirectUri: appConfiguration.app.frontendLink,
            playgroundRedirectUri: 'http://localhost:8080/api/auth/google/playground',
            callbackUrl: String(validateEnv('GOOGLE_CALLBACK_URL')),
        },
    };
};
