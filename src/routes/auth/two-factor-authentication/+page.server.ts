import { prisma } from '$lib/server/prisma';
import type { PageServerLoad, Actions } from './$types.js';
import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { backupCodesFormSchema, twoFactorAuthenticationFormSchema } from '$lib/schema';
import { lucia } from '$lib/server/auth.js';
import { TOTPController } from 'oslo/otp';
import { decodeHex } from 'oslo/encoding';
import { generateBackupCode, retrieveBackupCode } from '$lib/server/twoFactorAuthentication.js';

export const load: PageServerLoad = async (event) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	
	// If there's no session cookie, redirect to login
	if (!sessionId) {
	  throw redirect(302, '/auth/login');
	}
  
	const { session } = await lucia.validateSession(sessionId);
  
	// If session is invalid, redirect to login
	if (!session) {
	  throw redirect(302, '/auth/login');
	}
  
	// If two_factor_verified is true, redirect to dashboard
	if (session.two_factor_verified) {
	  throw redirect(302, '/dashboard');
	}
  
	// If we get here, the user is logged in but hasn't completed 2FA
	return {
	  twoFactorAuthenticationForm: await superValidate(zod(twoFactorAuthenticationFormSchema)),
	  backupCodesForm: await superValidate(zod(backupCodesFormSchema))
	};
  };

  export const actions: Actions = {
	verify2FA: async (event) => {
		const form = await superValidate(event, zod(twoFactorAuthenticationFormSchema));
		if (!form.valid) {
		  return fail(400, { form });
		}
		const { code: otp } = form.data;
		const sessionId = event.cookies.get(lucia.sessionCookieName);
	  
		if (!sessionId) {
		  return fail(401, { form, message: 'No session found' });
		}
	  
		try {
		  const { user, session } = await lucia.validateSession(sessionId);
	  
		  if (!user || !session) {
			return fail(401, { form, message: 'Invalid session' });
		  }
	  
		  const result = await prisma.user.findUnique({
			where: { id: user.id },
			select: { two_factor_secret: true }
		  });
	  
		  if (!result?.two_factor_secret) {
			return fail(400, { form, message: '2FA not set up for this user' });
		  }
	  
		  const validOTP = await new TOTPController().verify(otp, decodeHex(result.two_factor_secret));
	  
		  if (!validOTP) {
			return setError(form, "code", 'Invalid 2-Factor Authentication code');
		  }
	  
		  await lucia.invalidateSession(session.id);
		  const newSession = await lucia.createSession(user.id, {
			two_factor_verified: true
		  });
	  
		  const newSessionCookie = lucia.createSessionCookie(newSession.id);
		  event.cookies.set(newSessionCookie.name, newSessionCookie.value, {
			path: '.',
			...newSessionCookie.attributes
		  });
	  
		} catch (error) {
		  return fail(500, { form, message: 'An unexpected error occurred' });
		}
	  
		throw redirect(302, '/dashboard');
	  },
  
	verifyBackupCode: async (event) => {
	  const form = await superValidate(event, zod(backupCodesFormSchema));
	  if (!form.valid) {
		return fail(400, { form });
	  }
	  const { backupCode } = form.data;
	  const sessionId = event.cookies.get(lucia.sessionCookieName);
	  if (!sessionId) {
		return fail(401, { form, message: 'No session found' });
	  }
  
	  try {
		const { user, session } = await lucia.validateSession(sessionId);
  
		if (!user || !session) {
		  return fail(401, { form, message: 'Invalid session' });
		}
  
		const validBackupCode = await retrieveBackupCode(user.id);
  
		if (validBackupCode != backupCode) {
		  form.errors.backupCode = ['Backup Code Not Valid'];
		  return fail(400, { form });
		}
  
		await generateBackupCode(user.id);
  
		// Update session to set two_factor_verified to true
		await lucia.invalidateSession(session.id);
		const newSession = await lucia.createSession(user.id, {
		  two_factor_verified: true
		});
  
		const newSessionCookie = lucia.createSessionCookie(newSession.id);
		event.cookies.set(newSessionCookie.name, newSessionCookie.value, {
		  path: '.',
		  ...newSessionCookie.attributes
		});
	  } catch (error) {
		console.error('Error in verifyBackupCode:', error);
		return fail(500, { form, message: 'An unexpected error occurred' });
	  }
  
	  throw redirect(302, '/dashboard');
	}
  };
