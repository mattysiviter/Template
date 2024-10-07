import { prisma } from '$lib/server/prisma';
import type { PageServerLoad, Actions } from './$types.js';
import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import {
	backupCodesFormSchema,
	loginFormSchema,
	twoFactorAuthenticationFormSchema,
	verifyEmailFormSchema
} from '$lib/schema';
import { verify } from '@node-rs/argon2';
import { lucia } from '$lib/server/auth.js';
import { TOTPController } from 'oslo/otp';
import { decodeHex } from 'oslo/encoding';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) redirect(302, '/dashboard');
	return {
		loginForm: await superValidate(zod(loginFormSchema)),
		twoFactorAuthenticationForm: await superValidate(zod(twoFactorAuthenticationFormSchema)),
		backupCodesForm: await superValidate(zod(backupCodesFormSchema)),
		verifyEmailform: await superValidate(zod(verifyEmailFormSchema))
	};
};

export const actions: Actions = {
		login: async (event) => {
			const form = await superValidate(event, zod(loginFormSchema));
			if (!form.valid) {
			  return fail(400, {
				form
			  });
			}
		
			const { email, password } = form.data;
		
			const existingUser = await prisma.user.findUnique({ where: { email } });
		
			if (!existingUser) {
			  return setError(form, 'password', 'Incorrect username or password');
			}
		
			const validPassword = await verify(existingUser.password_hash, password, {
			  memoryCost: 19456,
			  timeCost: 2,
			  outputLen: 32,
			  parallelism: 1
			});
		
			if (!validPassword) {
			  form.errors.password = ['Incorrect username or password'];
			  return fail(400, { form });
			}
		
			// Create a session with two_factor_verified set to false
			const session = await lucia.createSession(existingUser.id, {
			  two_factor_verified: false
			});
		
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
			  path: '.',
			  ...sessionCookie.attributes
			});
		
			if (!existingUser.email_verified) {
			  return redirect(302, '/auth/verify-email');
			}
		
			if (existingUser.two_factor_secret) {
			  return redirect(302, '/auth/two-factor-authentication');
			}
		
			// If email is verified and 2FA is not set up, consider authentication complete
			// Update the session to set two_factor_verified to true
			await lucia.invalidateSession(session.id);
			const newSession = await lucia.createSession(existingUser.id, {
			  two_factor_verified: true
			});
		
			const newSessionCookie = lucia.createSessionCookie(newSession.id);
			event.cookies.set(newSessionCookie.name, newSessionCookie.value, {
			  path: '.',
			  ...newSessionCookie.attributes
			});
		
			return redirect(302, '/dashboard');
		  }
	
	  };