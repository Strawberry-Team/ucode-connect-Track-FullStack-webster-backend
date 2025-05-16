// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { EmailTemplateInterface } from './templates/email-template.interface';

const themeModules = {
    '1': () => import('./templates/email-templates')
};

@Injectable()
export class EmailService {
    private gmailUser: string;
    private appName: string;
    private logo: any;
    private templates: EmailTemplateInterface;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.gmailUser = String(
            this.configService.get<string>('google.gmailApi.user'),
        );
        this.appName = String(this.configService.get<string>('app.name'));

        this.init();
    }

    private async init() {
        const logoPath = String(
            this.configService.get<string>('app.logo.path'),
        );
        const logoFilename = String(
            this.configService.get<string>('app.logo.filename'),
        );
        this.logo = await this.readLogoFile(path.join(logoPath, logoFilename));

        await this.loadTemplates();
    }

    private async loadTemplates() {
        const themeId = '1';

        try {
            const module = await themeModules[themeId]();
                this.templates = module.default || module;
        } catch (error) {
            console.error(`Error loading email templates for theme ${themeId}:`, error);
            const defaultModule = await import('./templates/email-templates');
            this.templates = defaultModule.default || defaultModule;
        }
    }

    private async readLogoFile(filePath: string): Promise<Buffer> {
        return fs.readFileSync(path.resolve(filePath));
    }

    private async readHtmlFile(filePath: string): Promise<string> {
        return fs.readFileSync(path.resolve(filePath), 'utf-8');
    }

    private async createTransport() {
        return nodemailer.createTransport({
            host: this.configService.get<string>('ethereal.host'),
            port: this.configService.get<number>('ethereal.port'),
            auth: {
                user: this.configService.get<string>('ethereal.user'),
                pass: this.configService.get<string>('ethereal.password'),
            },
        });
    }

    async sendEmail(to: string, subject: string, html: string): Promise<void> {
        try {
            const transporter = await this.createTransport();

            const info = await transporter.sendMail({
                from: this.gmailUser,
                to,
                subject,
                html,
                attachments: [
                    {
                        filename: String(
                            this.configService.get<string>('app.logo.path'),
                        ),
                        content: this.logo,
                        cid: 'logo@project',
                    },
                ],
            });
            console.log(`Email sent successfully: ${info.messageId}`);
        } catch (error) {
            console.error(`Failed to send email to ${to}`, error);
            throw error;
        }
    }

    async sendConfirmationEmail(
        to: string,
        confirmationLink: string,
        fullName: string,
    ): Promise<void> {
        const html = this.templates.getConfirmationEmailTemplate(
            confirmationLink,
            this.appName,
            fullName
        );
        await this.sendEmail(
            to,
            `[Action Required] Confirm Email | ${this.appName}`,
            html,
        );
    }

    async sendResetPasswordEmail(to: string, resetLink: string, fullName: string): Promise<void> {
        const html = this.templates.getResetPasswordEmailTemplate(resetLink, this.appName, fullName);
        await this.sendEmail(
            to,
            `[Action Required] Password Reset | ${this.appName}`,
            html,
        );
    }
}
