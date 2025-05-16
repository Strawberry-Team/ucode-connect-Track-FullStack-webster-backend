// src/models/users/users.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { HashingPasswordsService } from './hashing-passwords.service';
import { AccountOwnerGuard } from './guards/account-owner.guard';
import { EmailModule } from '../../shared/email/email.module';
import { EmailService } from '../../shared/email/email.service';
import { HashingService } from '../../core/services/hashing.service';
@Module({
    imports: [EmailModule],
    controllers: [UsersController],
    providers: [
        UsersService,
        UsersRepository,
        HashingPasswordsService,
        AccountOwnerGuard,
        EmailService,
        HashingService,
    ],
    exports: [UsersService, UsersRepository, HashingPasswordsService],
})
export class UsersModule {}
