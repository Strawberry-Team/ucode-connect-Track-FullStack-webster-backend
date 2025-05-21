// src/modules/auth/auth.service.ts
import {
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateRefreshTokenNonceDto } from '../refresh-token-nonces/dto/create-refresh-nonce.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { UsersService } from '../users/users.service';
import { RefreshTokenNoncesService } from '../refresh-token-nonces/refresh-token-nonces.service';
import { JwtUtils } from '../../shared/jwt/jwt-token.utils';
import { HashingPasswordsService } from '../users/hashing-passwords.service';
import { convertToSeconds } from '../../core/utils/time.utils';
import { EmailService } from '../../shared/email/email.service';
import { ConfigService } from '@nestjs/config';
import { NonceUtils } from '../../core/utils/nonce.utils';
import { User } from '../users/entities/user.entity';
import { GoogleLoginDto } from './dto/google-login.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
    private frontUrl: string;
    private readonly logger = new Logger(AuthService.name);
    private readonly avatarStoragePath = path.join(process.cwd(), 'public', 'uploads', 'user-avatars');

    constructor(
        private readonly usersService: UsersService,
        private readonly refreshTokenNonceService: RefreshTokenNoncesService,
        private readonly jwtUtils: JwtUtils,
        private readonly passwordService: HashingPasswordsService,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService,
        private readonly nonceUtils: NonceUtils,
        private readonly httpService: HttpService,
    ) {
        this.frontUrl = String(
            this.configService.get<string>('app.frontendLink'),
        );
        this.ensureDirectoryExists(this.avatarStoragePath);
    }

    private async ensureDirectoryExists(directoryPath: string) {
        try {
            await fs.mkdir(directoryPath, { recursive: true });
        } catch (error) {
            this.logger.error(`Failed to create directory ${directoryPath}`, error.stack);
        }
    }

    async register(createUserDto: CreateUserDto) {
        const user = await this.usersService.createUser(createUserDto);
        try {
            this.sendConfirmationEmail(user);
        } catch (error) {
            this.logger.error(`Failed to send confirmation email for user ${user.id}`, error.stack);
        }
        return { user: user };
    }

    private async sendConfirmationEmail(user: User) {
        const result = this.jwtUtils.generateToken(
            { sub: user.id },
            'confirmEmail',
        );
        const link = this.frontUrl + 'auth/confirm-email/' + result;
        
        this.logger.log(`Sending confirmation email to ${user.email} with link ${link}`);
        
        this.emailService.sendConfirmationEmail(
            user.email,
            link,
            `${user.firstName}${!user.lastName ? '' : user.lastName}`,
        );
    }

    async confirmEmail(userId: number) {
        await this.usersService.confirmUserEmail(userId);
        return { message: 'Email confirmed successfully' };
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findUserByEmail(loginDto.email);

        const passwordValid = await this.passwordService.compare(
            loginDto.password,
            String(user.password),
        );

        if (!passwordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        if (!user.isEmailVerified) {
            throw new ForbiddenException('User email is unverified');
        }

        const newNonce = this.nonceUtils.generateNonce();

        const accessToken = this.jwtUtils.generateToken(
            { sub: user.id },
            'access',
        );
        const refreshToken = this.jwtUtils.generateToken(
            { sub: user.id, nonce: newNonce },
            'refresh',
        );

        await this.refreshTokenNonceService.createRefreshTokenNonce({
            userId: user.id,
            nonce: newNonce,
        } as CreateRefreshTokenNonceDto);

        return { user: await this.usersService.findUserByIdWithConfidential(user.id), accessToken, refreshToken };
    }

    async refreshAccessToken(
        userId: number,
        createdAt: number,
        refreshNonce: string,
    ) {
        const accessToken = this.jwtUtils.generateToken(
            { sub: userId },
            'access',
        );
        const time: number = new Date().getTime() / 1000;

        if (time - createdAt > convertToSeconds('1d')) {
            const newNonce = this.nonceUtils.generateNonce();
            const newRefreshToken = this.jwtUtils.generateToken(
                { sub: userId, nonce: newNonce },
                'refresh',
            );

            await this.refreshTokenNonceService.createRefreshTokenNonce({
                userId: userId,
                nonce: newNonce,
            } as CreateRefreshTokenNonceDto);

            const nonceId: number = await this.refreshTokenNonceService
                .findRefreshTokenNonceByNonceAndUserId(userId, refreshNonce)
                .then((nonce) => nonce.id);
            await this.refreshTokenNonceService.deleteRefreshTokenNonceById(
                nonceId,
            );
            return { accessToken, newRefreshToken };
        }

        return { accessToken };
    }

    async logout(userId: number, refreshNonceDto: string) {
        const nonceEntity =
            await this.refreshTokenNonceService.findRefreshTokenNonceByNonceAndUserId(
                userId,
                refreshNonceDto,
            );
        if (!nonceEntity) {
            throw new NotFoundException(
                `Refresh token for user id ${userId} not found`,
            );
        }

        await this.refreshTokenNonceService.deleteRefreshTokenNonceById(
            nonceEntity.id,
        );
        return { message: 'Logged out successfully' };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const user = await this.usersService.findUserByEmail(
            resetPasswordDto.email,
        );

        if (!user || !user.isEmailVerified) {
            throw new NotFoundException(
                'User with this email not found or you need verify your email',
            );
        }

        const passwordResetToken = this.jwtUtils.generateToken(
            { sub: user.id },
            'resetPassword',
        );

        const link =
            this.frontUrl + 'auth/reset-password/' + passwordResetToken;

        this.emailService.sendResetPasswordEmail(
            user.email,
            link,
            `${user.firstName}${!user.lastName ? '' : user.lastName}`,
        );

        return { message: 'Password recovery email sent' };
    }

    async confirmNewPassword(newPasswordDto: NewPasswordDto, userId: number) {
        await this.usersService.resetUserPassword(
            userId,
            newPasswordDto.newPassword,
        );
        await this.refreshTokenNonceService.deleteRefreshTokenNonceByUserId(
            userId,
        );
        return { message: 'Password has been reset successfully' };
    }

    private async downloadAndSaveAvatar(avatarUrl: string, userId: number): Promise<string | undefined> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(avatarUrl, { responseType: 'arraybuffer' }),
            );
            const mime = await import('node-mime');

            const contentType = response.headers['content-type'];
            if (!contentType) {
                this.logger.warn(`No content-type header found for avatar from ${avatarUrl} for user ${userId}. Defaulting to jpg.`);
            }
            const extension = contentType ? mime.getExtension(contentType) || 'jpg' : 'jpg';
            
            const filename = `${uuidv4()}.${extension}`;
            const filePath = path.join(this.avatarStoragePath, filename);

            await fs.writeFile(filePath, Buffer.from(response.data));
            this.logger.log(`Avatar for user ${userId} saved as ${filename}`);
            return filename;
        } catch (error) {
            this.logger.error(`Failed to download or save avatar from ${avatarUrl} for user ${userId}`, error.stack);
            return undefined;
        }
    }

    async googleLogin(googleLoginDto: GoogleLoginDto): Promise<{ user: User; accessToken: string; refreshToken: string }> {
        if (!googleLoginDto.email) {
            throw new UnauthorizedException('No email provided from Google');
        }

        let user: User;
        let justCreated = false;

        try {
            user = await this.usersService.findUserByEmail(googleLoginDto.email);

            if (!user.isEmailVerified) {
                this.logger.log(`User ${user.email} found but email not verified. Verifying now.`);
                await this.usersService.confirmUserEmail(user.id);
                user = await this.usersService.findUserByIdWithConfidential(user.id);
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                this.logger.log(`User with email ${googleLoginDto.email} not found. Creating new user.`);
                const randomPassword = this.nonceUtils.generateNonce(16); 
                
                const createUserDto: CreateUserDto = {
                    email: googleLoginDto.email,
                    password: randomPassword, 
                    firstName: googleLoginDto.firstName || 'User', 
                    lastName: googleLoginDto.lastName || '',    
                };
                
                const newUserRegistered = await this.usersService.createUser(createUserDto);
                
                await this.usersService.confirmUserEmail(newUserRegistered.id);
                user = newUserRegistered;
                justCreated = true;

            } else {
                this.logger.error(`Error finding user ${googleLoginDto.email}: ${error.message}`, error.stack);
                throw error;
            }
        }

        if (justCreated && googleLoginDto.avatarUrl) {
            this.logger.log(`Attempting to download avatar for new user ${user.email} from ${googleLoginDto.avatarUrl}`);
            const savedAvatarFileName = await this.downloadAndSaveAvatar(googleLoginDto.avatarUrl, user.id);
            if (savedAvatarFileName) {
                try {
                    await this.usersService.updateUserAvatar(user.id, savedAvatarFileName);
                    this.logger.log(`Avatar ${savedAvatarFileName} linked to user ${user.id}`);
                } catch (updateError) {
                    this.logger.error(`Failed to update user avatar in DB for user ${user.id} with ${savedAvatarFileName}`, updateError.stack);
                }
            }
        }
        
        const finalUser = await this.usersService.findUserByIdWithConfidential(user.id);

        const newNonce = this.nonceUtils.generateNonce();
        const accessToken = this.jwtUtils.generateToken({ sub: finalUser.id }, 'access');
        const refreshToken = this.jwtUtils.generateToken(
            { sub: finalUser.id, nonce: newNonce },
            'refresh',
        );

        await this.refreshTokenNonceService.createRefreshTokenNonce({
            userId: finalUser.id,
            nonce: newNonce,
        } as CreateRefreshTokenNonceDto);

        return { user: finalUser, accessToken, refreshToken };
    }
}
