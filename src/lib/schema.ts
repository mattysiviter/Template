import { z } from 'zod';

//Sign-up form schema
export const signUpFormSchema = z.object({
	firstname: z.string().min(1, 'First name is required'),
	lastname: z.string().min(1, 'Last name is required'),
	email: z.string().email('Invalid email address'),
	password: z
		.string()
		.min(8, '- Password must be at least 8 characters long')
		.regex(/[0-9]/, '- Password must contain at least one number')
		.regex(/[!@#$%^&*(),.?":{}|<>]/, '- Password must contain at least one special character')
});

export type SignUpFormSchema = typeof signUpFormSchema;

//Login form schema
export const loginFormSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required')
});

export type LoginFormSchema = typeof loginFormSchema;

//Verify email form schema
export const verifyEmailFormSchema = z.object({
	code: z.string()
});

export type VerifyEmailFormSchema = typeof verifyEmailFormSchema;

//Two-factor Authentication form schema
export const twoFactorAuthenticationFormSchema = z.object({
	code: z.string()
});

export type TwoFactorAuthenticationFormSchema = typeof twoFactorAuthenticationFormSchema;

//Backup codes form schema
export const backupCodesFormSchema = z.object({
	code: z.string()
});

export type BackupCodesFormSchema = typeof backupCodesFormSchema;

//Password reset form schema
export const passwordResetFormSchema = z.object({
	email: z.string().email('Invalid email address')
});

export type PasswordResetFormSchema = typeof passwordResetFormSchema;

//New password form schema - reset password

export const newPasswordFormSchema = z.object({
	newPassword: z
		.string()
		.min(8, '- Password must be at least 8 characters long')
		.regex(/[0-9]/, '- Password must contain at least one number')
		.regex(/[!@#$%^&*(),.?":{}|<>]/, '- Password must contain at least one special character'),
	repeatNewPassword: z.string()
});

export type NewPasswordFormSchema = typeof newPasswordFormSchema;