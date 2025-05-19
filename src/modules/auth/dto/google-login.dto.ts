// src/modules/auth/dto/google-login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from '../../../core/validators/email.validator';
import { IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
    @IsEmail(false)
    @ApiProperty({
        description: 'User email from Google',
        nullable: false,
        type: 'string',
        example: 'ann.nichols@gmail.com',
    })
    email: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'User first name from Google',
        nullable: true,
        type: 'string',
        example: 'Ann',
    })
    firstName?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'User last name from Google',
        nullable: true,
        type: 'string',
        example: 'Nichols',
    })
    lastName?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'User avatar URL from Google',
        nullable: true,
        type: 'string',
        example: 'https://lh3.googleusercontent.com/a/ACg8ocJ...'
    })
    avatarUrl?: string;
}
