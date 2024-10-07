import { prisma } from '$lib/server/prisma';
import type { PageServerLoad, Actions } from './$types.js';
import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { signUpFormSchema, verifyEmailFormSchema } from '$lib/schema.js';
import { hash } from '@node-rs/argon2';
import { generateIdFromEntropySize } from 'lucia';
import { lucia } from '$lib/server/auth.js';
import { generateEmailVerificationCode, sendVerificationCode, verifyVerificationCode } from '$lib/server/emailVerification.js';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user && event.locals.user.email_verified) redirect(302, '/dashboard');
	return {
		verifyEmailform: await superValidate(zod(verifyEmailFormSchema))
	};
};

export const actions: Actions = {
	verifyEmail: async (event) => {
		const form = await superValidate(event, zod(verifyEmailFormSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { code } = form.data;
		const sessionId = event.cookies.get(lucia.sessionCookieName);

		if (!sessionId) {
			return fail(401, { form });
		}

		const { user } = await lucia.validateSession(sessionId);

		if (!user) {
			return fail(401, { form });
		}

		const validCode = await verifyVerificationCode(user, code);

		if (!validCode) {
			return setError(form, 'code', 'Invalid Code');
		}

		await lucia.invalidateUserSessions(user.id);
		await prisma.user.update({
			where: {
				id: user.id
			},
			data: {
				email_verified: true
			}
		});

		const session = await lucia.createSession(user.id, {
			two_factor_verified: true
		});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		throw redirect(302, '/dashboard');
	},

	resendEmailVerification: async (event) => {
		console.log("Email resend requested");
	
		const sessionId = event.cookies.get(lucia.sessionCookieName);
		if (!sessionId) {
		  console.log("No session found");
		  return fail(401, { message: "No session found" });
		}
	
		try {
		  const { user } = await lucia.validateSession(sessionId);
		  if (!user) {
			console.log("Invalid session");
			return fail(401, { message: "Invalid session" });
		  }
	
		  const emailRecord = await prisma.emailVerificationCode.findUnique({
			where: { userId: user.id },
			select: { email: true }
		  });

		  
	
		  if (!emailRecord || !emailRecord.email) {
			console.log("No email found for user");
			return fail(400, { message: "No email associated with this account" });
		  }
	
		  const verificationCode = await generateEmailVerificationCode(user.id, emailRecord.email);
		  await sendVerificationCode(emailRecord.email, verificationCode);
	
		  console.log("Verification email sent successfully");
		  return { success: true, message: "Verification email sent successfully" };
		} catch (error) {
		  console.error("Error in resendEmailVerification:", error);
		  return fail(500, { message: "An unexpected error occurred" });
		}
	  }

};
