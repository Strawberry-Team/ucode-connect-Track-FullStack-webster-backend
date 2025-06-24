export interface EmailTemplateInterface {
    getConfirmationEmailTemplate: (
        confirmationLink: string,
        projectName: string,
        fullName: string,
        frontendLink: string,
    ) => string;

    getResetPasswordEmailTemplate: (
        resetLink: string,
        projectName: string,
        fullName: string,
        frontendLink: string,
    ) => string;
}
