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

        const googleLoginDto: GoogleLoginDto = {
            email: emails[0].value,
            firstName: name?.givenName,
            lastName: name?.familyName,
            avatarUrl: photos && photos.length > 0 ? photos[0].value : undefined,
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