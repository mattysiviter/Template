import type { PageServerLoad, Actions } from './$types.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { changePasswordFormSchema, codeTwoFactorAuthenticationFormSchema } from '$lib/schema.js';
import { prisma } from '$lib/server/prisma';
import { hash, verify } from '@node-rs/argon2';
import {
	disableTwoFactorAuth,
	generateBackupCode,
	generateTwoFAASetupData,
	retrieveBackupCode
} from '$lib/server/twoFactorAuthentication.js';
import { lucia } from '$lib/server/auth.js';
import { TOTPController } from 'oslo/otp';
import { decodeHex, encodeHex } from 'oslo/encoding';
import type { User } from 'lucia';

export const load: PageServerLoad = async (event) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		throw redirect(302, '/auth/login');
	}

	let enabled = false;
	let twoFASetupData = null;
	let backupCode = null;

	try {
		const { user } = await lucia.validateSession(sessionId);
		if (!user) {
			throw redirect(302, '/auth/login');
		}

		const userData = await prisma.user.findUnique({
			where: { id: user.id },
			select: { two_factor_secret: true, two_factor_enabled: true }
		});

		if (!userData) {
			throw error(404, 'User data not found');
		}

		enabled = userData.two_factor_enabled;

		if (userData.two_factor_secret && !userData.two_factor_enabled) {
			twoFASetupData = await generateTwoFAASetupData(user, userData.two_factor_secret);
		}

		if (userData.two_factor_secret && userData.two_factor_enabled) {
			backupCode = await retrieveBackupCode(user.id);
		}
	} catch (err) {
		console.error('Session validation error:', err);
		if (err instanceof Response && err.status === 302) {
			throw err;
		}
		// For unexpected errors, throw a generic error
		throw error(500, 'An unexpected error occurred');
	}

	// Single return statement outside of try-catch
	return {
		enabled,
		changePasswordForm: await superValidate(zod(changePasswordFormSchema)),
		codeTwoFactorAuthenticationForm: await superValidate(
			zod(codeTwoFactorAuthenticationFormSchema)
		),
		twoFASetupData,
		backupCode,
	};
};

export const actions: Actions = {
	setUpTwoFA: async (event) => {
		try {
			const sessionId = event.cookies.get(lucia.sessionCookieName);

			if (!sessionId) {
				return fail(401, { message: 'Unauthorized' });
			}

			const { user } = await lucia.validateSession(sessionId);

			if (!user) {
				return fail(401, { message: 'Unauthorized' });
			}

			const twoFactorSecret = crypto.getRandomValues(new Uint8Array(20));

			await prisma.user.update({
				where: {
					id: user.id
				},
				data: {
					two_factor_secret: encodeHex(twoFactorSecret)
				}
			});

			return {
				success: true
			};
		} catch (error) {
			console.error('Error in setUpTwoFA:', error);
			return fail(500, {
				message: 'An error occurred while setting up two-factor authentication.'
			});
		}
	},

	verify2FA: async (event) => {
		try {
			const form = await superValidate(event, zod(codeTwoFactorAuthenticationFormSchema));
			if (!form.valid) {
				return fail(400, {
					form
				});
			}
			const { code } = form.data;
			const sessionId = event.cookies.get(lucia.sessionCookieName);

			if (!sessionId) {
				console.log('!error');
				return fail(401, { message: 'Unauthorized' });
			}

			const { user } = await lucia.validateSession(sessionId);

			if (!user) {
				return fail(401, { message: 'Unauthorized' });
			}

			const result = await prisma.user.findUnique({
				where: { id: user.id },
				select: { two_factor_secret: true }
			});

			if (!result || result.two_factor_secret === null) {
				return fail(401, { message: 'Unauthorized' });
			}

			const validOTP = await new TOTPController().verify(code, decodeHex(result.two_factor_secret));

			if (!validOTP) {
				return setError(form, 'code', 'Invalid Code');
			}

			await prisma.user.update({
				where: {
					id: user.id
				},
				data: {
					two_factor_enabled: true
				}
			});

			const backupCode = await generateBackupCode(user.id);

			return {
				form,
				backupCode: backupCode
			};
		} catch (error) {
			console.error('Error in verify2FA:', error);
			return fail(500, { message: 'An error occurred while verifying two-factor authentication.' });
		}
	},

	cancelTwoFA: async (event) => {},

	disableTwoFA: async (event) => {
		try {
			const sessionId = event.cookies.get(lucia.sessionCookieName);

			if (!sessionId) {
				return fail(401, { message: 'Unauthorized' });
			}

			const { user } = await lucia.validateSession(sessionId);

			if (!user) {
				return fail(401, { message: 'Unauthorized' });
			}

			disableTwoFactorAuth(user.id);

			return { success: true };
		} catch (error) {
			console.error('Error in disableTwoFA:', error);
			return fail(500, { message: 'An error occurred while disabling two-factor authentication.' });
		}
	},

	newBackupCode: async (event) => {
		console.log('Start');
		const sessionId = event.cookies.get(lucia.sessionCookieName);

		if (!sessionId) {
			return fail(401, { message: 'Unauthorized' });
		}

		const { user } = await lucia.validateSession(sessionId);

		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		await generateBackupCode(user.id);
		return { success: true };
	},
	newPassword: async (event) => {
		const form = await superValidate(event, zod(changePasswordFormSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { currentPassword, newPassword, repeatNewPassword } = form.data;

		try {
			if (!event.locals.user) {
				throw new Error('User not authenticated');
			}

			const id = event.locals.user.id;

			const userId = (event.locals as { user: { id: string } }).user.id;
			const user = await prisma.user.findUnique({ where: { id: userId } });

			if (!user) {
				return fail(400, { form });
			}

			const validPassword = await verify(user.password_hash, currentPassword, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			if (!validPassword) {
				return setError(form, 'currentPassword', 'Incorrect password');
			}

			if (newPassword !== repeatNewPassword) {
				form.errors.repeatNewPassword = ['Passwords do not match'];
				return fail(400, { form });
			}

			if (newPassword === currentPassword && repeatNewPassword === currentPassword) {
				form.errors.repeatNewPassword = ['New password cannot be the same as current password'];
				form.errors.newPassword = [''];
				return fail(400, { form });
			}

			const newPasswordHash = await hash(newPassword, {
				// recommended minimum parameters
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			// Update the user's password in the database
			await prisma.user.update({
				where: { id },
				data: { password_hash: newPasswordHash }
			});
		} catch (error) {
			console.error('Password change error:', error);
			return fail(500, { form, error: 'An unexpected error occurred while changing the password' });
		}

		throw redirect(303, '/settings/account');
	}
};
function generateTwoFASetupData(user: User, two_factor_secret: string): any {
	throw new Error('Function not implemented.');
}
