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
	backupCode: z.string()
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

//Edit profile form schema
const capitalizeWord = (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

export const editProfileFormSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.refine(
			(name) => {
				const parts = name.trim().split(/\s+/);
				return parts.length === 2;
			},
			{ message: 'Please provide exactly two names (first name and last name)' }
		)
		.refine((name) => /^[A-Za-z\s]+$/.test(name), {
			message: 'Name must consist of alphabetic characters only (A-Z or a-z).'
		})
		.transform((name) => {
			const [firstName, lastName] = name.trim().split(/\s+/);
			return `${capitalizeWord(firstName)} ${capitalizeWord(lastName)}`;
		}),
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required')
});

export type EditProfileFormSchema = typeof editProfileFormSchema;

//Delete account form schema
export const deleteAccountFormSchema = z.object({
	usersname: z.string()
});

export type DeleteAccountFormSchema = typeof deleteAccountFormSchema;

//Change password form schema
export const changePasswordFormSchema = z.object({
	currentPassword: z.string(),
	newPassword: z
		.string()
		.min(8, '- Password must be at least 8 characters long')
		.regex(/[0-9]/, '- Password must contain at least one number')
		.regex(/[!@#$%^&*(),.?":{}|<>]/, '- Password must contain at least one special character'),
	repeatNewPassword: z.string()
});

export type ChangePasswordFormSchema = typeof changePasswordFormSchema;

// Enable two factor authentication form schema
export const codeTwoFactorAuthenticationFormSchema = z.object({
	code: z.string().length(6).regex(/^\d+$/, 'Must be a string of 6 digits'),
	manualEntryCode: z.string()
});

export type CodeTwoFactorAuthenticationFormSchema = typeof codeTwoFactorAuthenticationFormSchema;

//Update email form schema
export const updateEmailFormSchema = z.object({
	code: z.string()
});

export type UpdateEmailFormSchema = typeof updateEmailFormSchema;
