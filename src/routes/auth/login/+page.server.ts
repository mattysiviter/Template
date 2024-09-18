import {prisma} from '$lib/server/prisma';
import type { PageServerLoad, Actions } from './$types.js';
import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { loginFormSchema } from '$lib/schema';
import { verify } from '@node-rs/argon2';
import { lucia } from '$lib/server/auth.js';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) redirect(302, "/dashboard");
	return {
		form: await superValidate(zod(loginFormSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
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

		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		if(!event.locals.user?.email_verified) {
			return redirect(302,'/auth/verify-email')
		}

		if(!event.locals.user.setupTwoFactor) {
			return redirect(302,'/auth/two-factor-authentication')
		}

		redirect(302, '/dashboard');
	}
};
