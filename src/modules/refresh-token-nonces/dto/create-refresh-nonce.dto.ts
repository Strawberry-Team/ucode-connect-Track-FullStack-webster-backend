// src/modules/refresh-token-nonces/dto/create-refresh-nonce.dto.ts
import { IsId } from '../../../core/validators/id.validator';
import { IsName } from '../../../core/validators/name.validator';

export class CreateRefreshTokenNonceDto {
    @IsId(false)
    userId: number;

    @IsName(false)
    nonce: string;
}
