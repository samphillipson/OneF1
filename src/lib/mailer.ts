import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const fromEmail = process.env.RESEND_FROM_EMAIL || 'One F1 <onboarding@resend.dev>';

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${appUrl}/api/auth/verify?token=${token}`;

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Verify your email address - One F1',
      html: `
        <div>
          <h2>Welcome to One F1!</h2>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #e10600; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <br /><br />
          <p>Or copy and paste this URL into your browser:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        </div>
      `,
    });

    console.log("Verification email sent:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Reset your password - One F1',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset the password for your One F1 account.</p>
          <p>If you didn't make this request, you can safely ignore this email.</p>
          <br />
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #e10600; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          <br /><br />
          <p>Or copy and paste this URL into your browser:</p>
          <p style="word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link will expire in 1 hour.</p>
        </div>
      `,
    });

    console.log("Password reset email sent:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error };
  }
}
