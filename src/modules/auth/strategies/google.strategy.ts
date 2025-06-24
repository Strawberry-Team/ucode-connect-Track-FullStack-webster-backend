import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-google-oauth20";
import { Injectable, UnauthorizedException, InternalServerErrorException } from "@nestjs/common";
// import { Request } from 'express'; // Not used if passReqToCallback is false or req is not used in validate
import { AuthService } from "../auth.service";
import { GoogleLoginDto } from "../dto/google-login.dto";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService, // Inject AuthService
    ) {
        const clientID = configService.get<string>('google.clientId');
        const clientSecret = configService.get<string>('google.clientSecret');
        const callbackURL = configService.get<string>('google.callbackUrl');

        if (!clientID || !clientSecret || !callbackURL) {
            throw new InternalServerErrorException('Google OAuth configuration is missing (clientId, clientSecret, or callbackUrl)');
        }

        super({
            clientID,
            clientSecret,
            callbackURL,
            scope: ['email', 'profile'],
            passReqToCallback: true,
        });
    }

    async validate(req: any, accessToken: string, refreshToken: string, profile: Profile): Promise<any> {
        // console.log('GoogleStrategy Validate:');
        // console.log('Request object (if needed):', req); // For debugging
        // console.log('AccessToken:', accessToken); // For debugging, remove in production
        // console.log('RefreshToken:', refreshToken); // For debugging, remove in production
        // console.log('Profile:', profile); // For debugging, remove in production

        const { name, emails, photos } = profile; 
        if (!emails || emails.length === 0 || !emails[0].value) {
            throw new UnauthorizedException('No email found in Google profile');
        }

        // Get the highest quality photo
        let avatarUrl: string | undefined;
        if (photos && photos.length > 0) {
            // Google usually returns photos in low quality with size s96-c
            // Replace with s400-c for better quality or remove size for original size
            const originalPhotoUrl = photos[0].value;
            
            // If URL contains size (e.g. s96-c), replace with s400-c for better quality
            if (originalPhotoUrl.includes('=s96-c') || originalPhotoUrl.includes('=s50-c')) {
                avatarUrl = originalPhotoUrl.replace(/=s\d+-c/, '=s400-c');
            } else if (originalPhotoUrl.includes('=s')) {
                // If there is another size, also replace
                avatarUrl = originalPhotoUrl.replace(/=s\d+/, '=s400');
            } else {
                avatarUrl = originalPhotoUrl;
            }
        }

        const googleLoginDto: GoogleLoginDto = {
            email: emails[0].value,
            firstName: name?.givenName,
            lastName: name?.familyName,
            avatarUrl,
        };
        
        // The authService.googleLogin method should handle user creation/login and token generation
        // It was implemented in the previous step.
        try {
            const result = await this.authService.googleLogin(googleLoginDto);
            return result; // This will be attached to req.user in the callback controller
        } catch (error) {
            // Log the error or handle it as needed
            // console.error('Error in GoogleStrategy validate calling authService.googleLogin:', error);
            throw new UnauthorizedException('Failed to process Google authentication', error.message);
        }
    }
}