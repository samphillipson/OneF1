import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter;

async function initMailer() {
  if (transporter) return transporter;

  // Generate a test account on Ethereal Email for local testing
  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log('Ethereal Test Account Created:', testAccount.user);
  return transporter;
}

export async function sendVerificationEmail(email: string, token: string) {
  const tp = await initMailer();
  
  const verifyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`;

  const info = await tp.sendMail({
    from: '"F1 AI Companion" <noreply@f1aic.com>',
    to: email,
    subject: "Verify your email address",
    text: `Welcome to F1 AI Companion! Please verify your email by clicking this link: ${verifyUrl}`,
    html: `<p>Welcome to F1 AI Companion!</p><p>Please verify your email by clicking <a href="${verifyUrl}">here</a>.</p>`,
  });

  console.log("Message sent: %s", info.messageId);
  // This URL will show the generated email. Useful for testing without real SMTP.
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
