// src/email/email.module.ts
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import appConfig from '../../config/app.config';
import etherealConfig from '../../config/ethereal.config';

@Module({
    imports: [
        ConfigModule.forFeature(appConfig),
        ConfigModule.forFeature(etherealConfig),
    ],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule {}
