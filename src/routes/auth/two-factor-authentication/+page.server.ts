import type { PageServerLoad, Actions } from './$types.js';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { backupCodesFormSchema, twoFactorAuthenticationFormSchema } from '$lib/schema';
import { decodeHex } from 'oslo/encoding';
import { TOTPController } from 'oslo/otp';
import { lucia } from '$lib/server/auth.js';
import { prisma } from '$lib/server/prisma.js';

export const load: PageServerLoad = async (event) => {
    // Check if user is already authenticated and has completed 2FA
    if (event.locals.user && event.locals.session?.twoFACompleted) {
        throw redirect(302, "/dashboard"); // Redirect to dashboard if 2FA is already completed
    }

    if(event.locals.user && !event.locals.user.setupTwoFactor){
        throw redirect(302, "/dashboard");
    }

    // If user is not authenticated at all, redirect to login
    if (!event.locals.user) {
        throw redirect(302, "/auth/login");
    }
    
    return {
        twoFactorAuthenticationForm: await superValidate(zod(twoFactorAuthenticationFormSchema)),
        backupCodesForm: await superValidate(zod(backupCodesFormSchema))
    };
};

export const actions: Actions = {
    default: async (event) => {
        const form = await superValidate(event, zod(twoFactorAuthenticationFormSchema));
        if (!form.valid) {
            return fail(400, { form });
        }
        const { code: otp } = form.data;
        const sessionId = event.cookies.get(lucia.sessionCookieName);

        if (!sessionId) {
            return fail(401, { form, message: 'No session found' });
        }

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
            return fail(400, { form, message: 'Invalid 2-Factor Authentication code' });
        }

        // If the code is valid, update the session
        await prisma.session.update({
            where: { id: session.id },
            data: { twoFACompleted: true }
        });
    
        // Invalidate all other sessions for this user that haven't completed 2FA
        await prisma.session.updateMany({
            where: {
                userId: user.id,
                id: { not: session.id },
                twoFACompleted: false
            },
            data: { expiresAt: new Date() }
        });

        // Redirect to dashboard after successful 2FA
        throw redirect(302, "/dashboard");
    }
};