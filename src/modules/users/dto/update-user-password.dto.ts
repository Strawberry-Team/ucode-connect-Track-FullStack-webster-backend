// src/modules/users/dto/update-user-password.dto.ts
import {
    IsPassword,
} from '../validators/users.validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserPasswordDto {
    @IsPassword(false)
    @ApiProperty({
        required: true,
        description: 'Old Password',
        nullable: false,
        type: 'string',
        example: 'Password123!',
    })
    oldPassword: string;

    @IsPassword(false)
    @ApiProperty({
        required: true,
        description: 'New Password',
        nullable: false,
        type: 'string',
        example: 'Password123!$',
    })
    newPassword: string;
}
