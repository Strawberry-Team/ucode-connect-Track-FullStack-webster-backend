// src/modules/refresh-token-nonces/refresh-token-nonces.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { RefreshTokenNoncesService } from './refresh-token-nonces.service';
import { RefreshTokenNoncesRepository } from './refresh-token-nonces.repository';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { NonceUtils } from '../../core/utils/nonce.utils';

@Module({
    imports: [
        JwtModule.register({}),
        forwardRef(() => AuthModule),
        UsersModule,
    ],
    providers: [
        RefreshTokenNoncesService,
        RefreshTokenNoncesRepository,
        NonceUtils,
    ],
    exports: [RefreshTokenNoncesService, NonceUtils],
})
export class RefreshTokenNoncesModule {}
