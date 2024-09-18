import { TimeSpan, createDate } from 'oslo';
import { sha256 } from 'oslo/crypto';
import { encodeHex } from 'oslo/encoding';
import { generateIdFromEntropySize } from 'lucia';
import { prisma } from './prisma';
import * as brevo from '@getbrevo/brevo';

const apiInstance = new brevo.TransactionalEmailsApi();

// Configure API key authorization
const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
    throw new Error('BREVO_API_KEY environment variable is not set');
}
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

export async function sendPasswordResetToken(to: string, verificationLink: string): Promise<void> {
    let sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = 'Reset Your Password';
    sendSmtpEmail.htmlContent = `
    <html>
      <body>
        <h1>Reset Your Password</h1>
        <p>You have requested to reset your password. Click the link below to set a new password:</p>
        <p><a href="${verificationLink}" target="_self">Reset Your Password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 24 hours for security reasons.</p>
      </body>
    </html>
  `;
    sendSmtpEmail.sender = { name: 'ContentMolf', email: 'matthewsiviter@contentmolf.com' };
    sendSmtpEmail.to = [{ email: to, name: 'User' }];

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Password reset email sent successfully');
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
}



export async function createPasswordResetToken(userId: string): Promise<string> {
	// Optionally invalidate all existing tokens
	await prisma.passwordResetToken.deleteMany({
		where: {
			userId: userId
		}
	});

	const tokenId = generateIdFromEntropySize(25); // 40 character
	const tokenHash = encodeHex(await sha256(new TextEncoder().encode(tokenId)));

	await prisma.passwordResetToken.create({
		data: {
			tokenHash: tokenHash,
			userId: userId,
			expires_at: createDate(new TimeSpan(2, 'h'))
		}
	});

	return tokenId;
}
