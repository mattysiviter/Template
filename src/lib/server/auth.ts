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
			two_factor_enabled: attributes.two_factor_enabled,
		};
	},
		getSessionAttributes: (attributes) => {
			return {
				// attributes has the type of DatabaseSessionAttributes
				two_factor_verified: attributes.two_factor_verified
			};
	
	}
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
	two_factor_enabled: boolean;
}

interface DatabaseSessionAttributes {
	two_factor_verified: boolean;
}
