import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { passwordResetFormSchema } from '$lib/schema.js';
import { prisma } from '$lib/server/prisma.js';
import { createPasswordResetToken, sendPasswordResetToken } from '$lib/server/resetPassword.js';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(passwordResetFormSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(passwordResetFormSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { email } = form.data;

		const user = await prisma.user.findUnique({
			where: {
				email: email
			}
		});

		if (!user) {
			return { form, success: true };
		}

		const verificationToken = await createPasswordResetToken(user.id);
		const verificationLink = `http://localhost:5173/auth/reset-password/${verificationToken}`;
		await sendPasswordResetToken(email, verificationLink);

		return { form, success: true };
	}
};
