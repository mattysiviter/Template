import { TimeSpan, createDate, isWithinExpirationDate } from 'oslo';
import { generateRandomString, alphabet } from 'oslo/crypto';
import { prisma } from './prisma';
import * as brevo from '@getbrevo/brevo';
import type { User } from 'lucia';

const apiInstance = new brevo.TransactionalEmailsApi();

// Configure API key authorization
const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
	throw new Error('BREVO_API_KEY environment variable is not set');
}
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

export async function sendVerificationCode(to: string, verificationCode: string): Promise<void> {
	let sendSmtpEmail = new brevo.SendSmtpEmail();

	sendSmtpEmail.subject = 'Verify your email address';
	sendSmtpEmail.htmlContent = `
    <html>
      <body>
        <h1>Verify your email address</h1>
        <p>Your Verification Code is:</p>
        <p>${verificationCode}</p>
      </body>
    </html>
  `;
	sendSmtpEmail.sender = { name: 'ContentMolf', email: 'matthewsiviter@contentmolf.com' };
	sendSmtpEmail.to = [{ email: to, name: 'New User' }];

	try {
		const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
	} catch (error) {
		console.error('Error sending email:', error);
		throw error;
	}
}

//Generate email verification code
export async function generateEmailVerificationCode(
	userId: string,
	email: string
): Promise<string> {
	await prisma.emailVerificationCode.deleteMany({
		where: { userId }
	});
	const code = generateRandomString(8, alphabet('0-9'));
	await prisma.emailVerificationCode.create({
		data: {
			userId,
			email,
			code,
			expires_at: createDate(new TimeSpan(15, 'm'))
		}
	});

	return code;
}

//Verify email verification code
export async function verifyVerificationCode(user: User, code: string): Promise<boolean> {
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
	if (databaseCode.email !== user.email) {
		return false;
	}
	return true;
}
