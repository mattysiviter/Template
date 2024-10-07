import { generateIdFromEntropySize } from 'lucia';
import { prisma } from './prisma';
import { decodeHex, encodeHex } from 'oslo/encoding';
import { sha256 } from 'oslo/crypto';
import { createDate, TimeSpan } from 'oslo';
import CryptoJS from 'crypto-js';
import { createTOTPKeyURI } from 'oslo/otp';
import * as QRCode from 'qrcode';
import type { User } from 'lucia';

const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
	throw new Error('Secret key is not defined');
}

export async function disableTwoFactorAuth(userId: string) {
	await prisma.$transaction(async (tx) => {
		// Disable 2FA by setting two_factor_secret to null
		await tx.user.update({
			where: { id: userId },
			data: { two_factor_secret: null, two_factor_enabled: false }
		});

		// Delete associated backup codes
		await tx.backupCode.delete({
			where: { userId: userId }
		});
	});
}

export async function generateTwoFAASetupData(user: User, encodedSecret: string) {
	const twoFactorSecret = decodeHex(encodedSecret);
	const uri = createTOTPKeyURI('contentmolf', user.email, twoFactorSecret);
	const qrcode = await QRCode.toDataURL(uri);

	return {
		qrcode,
		manualEntryCode: encodedSecret
	};
}

export async function generateBackupCode(userId: string): Promise<string> {
	// Optionally invalidate all existing tokens (even if none exist)
	await prisma.backupCode.deleteMany({
		where: {
			userId: userId
		}
	});

	// Generate a 12-character alphanumeric backup code using Oslo
	const backupCode = generateIdFromEntropySize(12).slice(0, 12);

	if (!secretKey) {
		throw new Error('Secret key is not defined');
	}

	const encryptedBackupCode = CryptoJS.AES.encrypt(backupCode, secretKey).toString();

	// Store the new backup code
	await prisma.backupCode.create({
		data: {
			code: encryptedBackupCode,
			userId: userId,
			expires_at: createDate(new TimeSpan(2, 'h')) // 2 hours expiration
		}
	});

	return backupCode;
}

export async function retrieveBackupCode(userId: string) {
	// Fetch the hashed backup code from the database
	const storedBackupCode = await prisma.backupCode.findUnique({
		where: {
			userId: userId
		},
		select: {
			code: true // The stored hashed code
		}
	});

	if (!storedBackupCode) {
		return null; // Ensure we have a code to work with
	}

	// Access the code property to get the encrypted backup code
	const encryptedCode = storedBackupCode.code; // <- Accessing the `code` property

	// Ensure secretKey is defined
	if (!secretKey) {
		throw new Error('Secret key is not defined');
	}

	const bytes = CryptoJS.AES.decrypt(encryptedCode, secretKey);
	const decrypted = bytes.toString(CryptoJS.enc.Utf8);
	return decrypted;
}
