import type { PageServerLoad, Actions } from './$types.js';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { verifyEmailFormSchema } from '$lib/schema.js';
import { lucia } from '$lib/server/auth.js';
import { prisma } from '$lib/server/prisma.js';
import { verifyVerificationCode } from '$lib/server/emailVerification.js';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) redirect(302, "/auth/login");

	if(event.locals.user.email_verified) redirect(302, "/dashboard");

	return {
		form: await superValidate(zod(verifyEmailFormSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
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
			return form.errors.code = ["Invalid code"]
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

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/dashboard');
	}
};
