import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { lucia } from '$lib/server/auth';
import { prisma } from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const sessionId = cookies.get(lucia.sessionCookieName);

    if (!sessionId) {
        console.log('!error');
        return json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { user } = await lucia.validateSession(sessionId);

    if (!user) {
        return json({ message: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            two_factor_secret: null,
        }
    });

    return json({ success: true }, { status: 200 });
};
