import type { PageServerLoad, Actions } from "./$types.js";
import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { newPasswordFormSchema } from "$lib/schema";
import { encodeHex } from "oslo/encoding";
import { sha256 } from "oslo/crypto";
import { prisma } from "$lib/server/prisma.js";
import { isWithinExpirationDate } from "oslo";
import { lucia } from "$lib/server/auth.js";
import { hash } from "@node-rs/argon2";
 
export const load: PageServerLoad = async () => {
 return {
  form: await superValidate(zod(newPasswordFormSchema)),
 };
};
 

export const actions: Actions = {
    default: async (event) => {
        
        const form = await superValidate(event, zod(newPasswordFormSchema));
        if (!form.valid) {
            return fail(400, {
                form,
            });
        }
        const { request, params} = event;
        const { newPassword } = form.data;
        const verificationToken = params.token;
        const tokenHash = encodeHex(await sha256(new TextEncoder().encode(verificationToken)));

        const token = await prisma.passwordResetToken.findUnique({
            where: { tokenHash: tokenHash }
        });

        if (!token || !isWithinExpirationDate(token.expires_at)) {
            return fail(400, { message: "Invalid or expired token" });
        }

        try {
            await lucia.invalidateUserSessions(token.userId);
            const passwordHash = await hash(newPassword, {
                memoryCost: 19456,
                timeCost: 2,
                outputLen: 32,
                parallelism: 1
            });

            await prisma.user.update({
                where: { id: token.userId },
                data: { password_hash: passwordHash }
            });

            const session = await lucia.createSession(token.userId, {});
            const sessionCookie = lucia.createSessionCookie(session.id);

            // Set the cookie
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: ".",
                ...sessionCookie.attributes
            });
            
        } catch (error) {
            console.error("Password reset failed:", error);
            return fail(500, { message: "An error occurred during password reset" });
        }
        // Redirect to home page
        throw redirect(302, '/auth/login');
    }
};