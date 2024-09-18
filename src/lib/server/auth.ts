// src/lib/server/auth.ts
import { Lucia } from 'lucia';
import { dev } from '$app/environment';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { prisma } from './prisma';

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			// attributes has the type of DatabaseUserAttributes
			email: attributes.email,
			displayName: attributes.displayName,
			email_verified: attributes.email_verified,
			setupTwoFactor: attributes.two_factor_secret !== null
		};
	},
	getSessionAttributes: (attributes) => {
		return {
			twoFACompleted: attributes.twoFACompleted,
		};
	},
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
		DatabaseSessionAttributes: DatabaseSessionAttributes;
	}
}

interface DatabaseUserAttributes {
	email: string;
	displayName: string;
	email_verified: boolean;
	two_factor_secret: string | null;
}

interface DatabaseSessionAttributes{
	twoFACompleted: boolean;
}
