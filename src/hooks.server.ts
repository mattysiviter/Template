import { lucia } from "$lib/server/auth";
import type { Handle } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get(lucia.sessionCookieName);
    if (!sessionId) {
        event.locals.user = null;
        event.locals.session = null;
    } else {
        const { session, user } = await lucia.validateSession(sessionId);
        if (session && session.fresh) {
            const sessionCookie = lucia.createSessionCookie(session.id);
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: ".",
                ...sessionCookie.attributes
            });
        }
        if (!session) {
            const sessionCookie = lucia.createBlankSessionCookie();
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: ".",
                ...sessionCookie.attributes
            });
        }
        event.locals.user = user;
        event.locals.session = session;
    }

    // Protected route check
    const routeId = event.route.id;
   
    
    // Check if the route is protected
	if (routeId?.startsWith('/(protected)') && !event.locals.user) {
		throw redirect(303, '/auth/login');
	}

    // Resolve the response
    const response = await resolve(event);

    // Set security headers
    response.headers.set('Referrer-Policy', 'strict-origin');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');

    return response;
};