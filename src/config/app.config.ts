// src/config/app.config.ts
import * as dotenv from 'dotenv';
import { validateEnv } from '../core/utils/env.utils';

dotenv.config({ path: '.env.development' });

export default () => {
    const frontendProtocol = String(validateEnv('APP_FRONTEND_PROTOCOL'));
    const frontendHost = String(validateEnv('APP_FRONTEND_HOST'));
    const frontendPort = parseInt(String(validateEnv('APP_FRONTEND_PORT')), 10);

    return {
        app: {
            name: String(validateEnv('APP_NAME')),
            supportEmail: String(validateEnv('APP_SUPPORT_EMAIL')),
            port: parseInt(String(validateEnv('APP_PORT')), 10),
            host: String(validateEnv('APP_HOST')),
            globalPrefix: 'api',
            protocol: String(validateEnv('APP_PROTOCOL')),
            passwordSaltRounds: 10,
            promoCodeSaltRounds: 10,
            frontendProtocol,
            frontendHost,
            frontendPort,
            // frontendLink: `${frontendProtocol}://${frontendHost}:${frontendPort}/`,
            frontendLink: `${frontendProtocol}://${frontendHost}/`,
            nodeEnv: String(validateEnv('APP_NODE_ENV')),
            logo: {
                path: './public/project',
                filename: "logo.png",
            },
            cors: {
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-TOKEN'],
                credentials: true,
            },
            csrf: {
                cookie: {
                    key: 'X-CSRF-TOKEN',
                    // httpOnly: false,
                    httpOnly: true,
                    secure: true, // Cookies are only transmitted via HTTPS
                    sameSite: 'none',
                    // sameSite: 'strict',
                },
                ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
            },
        },
    };
};
