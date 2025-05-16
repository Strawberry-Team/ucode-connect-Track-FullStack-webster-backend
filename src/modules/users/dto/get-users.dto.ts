// src/modules/users/dto/get-users.dto.ts
import { IsEmail } from '../../../core/validators/email.validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetUsersDto {
    @IsEmail(false)
    @ApiProperty({
        required: true,
        type: String,
        description: 'Email address of the user to retrieve',
        example: 'ann.nichols@gmail.ua',
    })
    email: string;
}
