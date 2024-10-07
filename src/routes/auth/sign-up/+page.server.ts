import { prisma } from '$lib/server/prisma';
import type { PageServerLoad, Actions } from './$types.js';
import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { signUpFormSchema, verifyEmailFormSchema } from '$lib/schema.js';
import { hash } from '@node-rs/argon2';
import { generateIdFromEntropySize } from 'lucia';
import { lucia } from '$lib/server/auth.js';
import {
	generateEmailVerificationCode,
	sendVerificationCode
} from '$lib/server/emailVerification.js';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user && event.locals.user.email_verified) redirect(302, '/dashboard');
	return {
		form: await superValidate(zod(signUpFormSchema)),
		verifyEmailform: await superValidate(zod(verifyEmailFormSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(signUpFormSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { firstname, lastname, email, password } = form.data;

		const displayName = `${firstname} ${lastname}`;

		const existingUser = await prisma.user.findUnique({ where: { email } });

		if (existingUser) {
			return setError(form, 'email', 'User with this email already exists');
		}

		const passwordHash = await hash(password, {
			// recommended minimum parameters
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		const userId = generateIdFromEntropySize(10);

		const user = await prisma.user.create({
			data: {
				id: userId,
				email: email,
				password_hash: passwordHash,
				displayName: displayName,
				two_factor_secret: null
			}
		});

		const verificationCode = await generateEmailVerificationCode(userId, email);
		await sendVerificationCode(email, verificationCode);

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes
		});

		throw redirect(303, '/auth/verify-email');
	}
};
