// src/core/utils/nonce.utils.ts
import { randomBytes } from 'crypto';

export class NonceUtils {
    generateNonce(bytesLength = 16): string {
        return randomBytes(bytesLength).toString('hex');
    }
}
