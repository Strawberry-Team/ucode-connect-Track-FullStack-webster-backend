// src/modules/auth/auth.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtResetPasswordStrategy } from './strategies/jwt-reset-password.strategy';
import { JwtConfirmEmailStrategy } from './strategies/jwt-confirm-email.strategy';
import { UsersModule } from '../users/users.module';
import { RefreshTokenNoncesModule } from '../../modules/refresh-token-nonces/refresh-token-nonces.module';
import {
    JwtAuthGuard,
    JwtRefreshGuard,
    JwtResetPasswordGuard,
    JwtConfirmEmailGuard,
} from './guards/auth.guards';
import { EmailModule } from '../../shared/email/email.module';
import { GoogleStrategy } from './strategies/google.strategy';
// import { GoogleAuthGuard } from './guards/google-auth.guards'; // Remove if using AuthGuard('google') directly
import { ConfigModule, ConfigService } from '@nestjs/config'; // Added ConfigService for JwtModule
import googleConfig from '../../config/google.config';
import { PassportModule } from '@nestjs/passport'; // Import PassportModule
import { JwtModule } from '@nestjs/jwt'; // Import JwtModule
import { HttpModule } from '@nestjs/axios'; // Import HttpModule

@Module({
    imports: [
        UsersModule,
        EmailModule,
        forwardRef(() => RefreshTokenNoncesModule),
        ConfigModule.forFeature(googleConfig),
        PassportModule.register({ defaultStrategy: 'jwt' }), // Add PassportModule
        JwtModule.registerAsync({ // Add JwtModule, assuming async setup for env variables
            imports: [ConfigModule], // Make sure ConfigModule is available
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('jwt.accessSecret'), // Adjust key as per your config
                signOptions: { 
                    expiresIn: configService.get<string>('jwt.accessExpiresIn'), // Adjust key
                },
            }),
            inject: [ConfigService],
        }),
        HttpModule, // Add HttpModule
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtAccessStrategy,
        JwtResetPasswordStrategy,
        JwtConfirmEmailStrategy,
        JwtRefreshStrategy,
        GoogleStrategy,
        JwtAuthGuard,
        JwtRefreshGuard,
        JwtResetPasswordGuard,
        JwtConfirmEmailGuard,
        // GoogleAuthGuard, // Remove if using AuthGuard('google') directly in controller
    ],
    exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
