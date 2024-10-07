import type { PageServerLoad, Actions } from './$types.js';
import { fail, redirect } from '@sveltejs/kit';
import { message, setError, superValidate, type Infer } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import {
	editProfileFormSchema,
	deleteAccountFormSchema,
	updateEmailFormSchema
} from '$lib/schema.js';
import { prisma } from '$lib/server/prisma.js';
import { verify } from '@node-rs/argon2';
import { sendUpdateEmailToken, verifyUpdateEmailCode } from '$lib/server/updateEmail.js';
import { lucia } from '$lib/server/auth.js';
import {
	generateEmailVerificationCode,
	sendVerificationCode,
	verifyVerificationCode
} from '$lib/server/emailVerification.js';
export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) redirect(302, '/auth/login');

	return {
		name: event.locals.user.displayName,
		email: event.locals.user.email,
		editProfileForm: await superValidate(zod(editProfileFormSchema)),
		updateEmailForm: await superValidate(zod(updateEmailFormSchema)),
		deleteAccountForm: await superValidate(zod(deleteAccountFormSchema))
	};
};

export const actions: Actions = {
	editProfile: async (event) => {
		const form = await superValidate<Infer<typeof editProfileFormSchema>, string>(
			event,
			zod(editProfileFormSchema)
		);
		if (!form.valid) {
			return fail(400, { form });
		}
		const { name, email, password } = form.data;
		const userId = (event.locals as { user: { id: string } }).user.id;
		const user = await prisma.user.findUnique({ where: { id: userId } });

		if (!user) {
			return fail(400, { form });
		}

		if (name === user.displayName && email === user.email) {
			return setError(form, 'password', 'No changes made');
		}

		const validPassword = await verify(user.password_hash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		if (!validPassword) {
			return setError(form, 'password', 'Incorrect password');
		}

		let nameUpdated = false;

		if (name !== user.displayName) {
			await prisma.user.update({
				where: { id: userId },
				data: { displayName: name }
			});
			nameUpdated = true;
		}

		if (email !== user.email) {
			const verificationCode = await generateEmailVerificationCode(userId, email);
			await sendVerificationCode(email, verificationCode);
			return {
				form,
				emailUpdateInitiated: true,
				nameUpdated: nameUpdated
			};
		}

		return {
			form,
			success: true,
			nameUpdated
		};
	},
	updateEmail: async (event) => {
		const form = await superValidate(event, zod(updateEmailFormSchema));
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

		const validCode = await verifyUpdateEmailCode(user, code);

		if (validCode === false) {
			return setError(form, 'code', 'Invalid Code - false');
		}

		// At this point, TypeScript knows validCode is not false
		if (!validCode.valid) {
			return setError(form, 'code', 'Invalid Code');
		}

		const newEmail = validCode.email;
		if (!newEmail) {
			return setError(form, 'code', 'Email not found');
		}

		await lucia.invalidateUserSessions(user.id);
		await prisma.user.update({
			where: {
				id: user.id
			},
			data: {
				email: validCode.email
			}
		});

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		return {
			form
		};
	},

	deleteAccount: async (event) => {
		const form = await superValidate(event, zod(deleteAccountFormSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { usersname } = form.data;
		const userId = (event.locals as { user: { id: string } }).user.id;
		const user = await prisma.user.findUnique({ where: { id: userId } });

		if (!user) {
			return fail(400, { form });
		}

		await prisma.user.delete({
			where: {
				id: userId
			}
		});

		return {
			form,
			success: true,
			status: 200
		};
	}
};
