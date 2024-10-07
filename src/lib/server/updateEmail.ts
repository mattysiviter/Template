import { TimeSpan, createDate, isWithinExpirationDate } from 'oslo';
import { sha256 } from 'oslo/crypto';
import { encodeHex } from 'oslo/encoding';
import { generateIdFromEntropySize, type User } from 'lucia';
import { prisma } from './prisma';
import * as brevo from '@getbrevo/brevo';

const apiInstance = new brevo.TransactionalEmailsApi();

// Configure API key authorization
const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
	throw new Error('BREVO_API_KEY environment variable is not set');
}
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

export async function sendUpdateEmailToken(to: string, verificationLink: string): Promise<void> {
	let sendSmtpEmail = new brevo.SendSmtpEmail();

	sendSmtpEmail.subject = 'Update Email';
	sendSmtpEmail.htmlContent = `
    <html>
      <body>
        <h1>Verify Email</h1>
        <p>You have requested to update your email. Click the link below to verify new email:</p>
        <p><a href="${verificationLink}" target="_self">Verify Email</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 24 hours for security reasons.</p>
      </body>
    </html>
  `;
	sendSmtpEmail.sender = { name: 'ContentMolf', email: 'matthewsiviter@contentmolf.com' };
	sendSmtpEmail.to = [{ email: to, name: 'User' }];

	try {
		const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
	} catch (error) {
		console.error('Error sending password reset email:', error);
		throw error;
	}
}

//Verify email verification code
export async function verifyUpdateEmailCode(user: User, code: string) {
	const databaseCode = await prisma.emailVerificationCode.findFirst({
		where: {
			userId: user.id
		}
	});

	if (!databaseCode || databaseCode.code !== code) {
		return false;
	}
	await prisma.emailVerificationCode.delete({
		where: {
			id: databaseCode.id
		}
	});

	if (!isWithinExpirationDate(databaseCode.expires_at)) {
		return false;
	}
	return { valid: true, email: databaseCode.email };
}
