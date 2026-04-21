# Add Registration, Login Forms & Email Verification

This plan outlines the implementation of user registration, credentials-based sign-in, and email verification using NextAuth and a local JSON store.

## User Review Required

> [!IMPORTANT]
> **Email Verification Testing**: To send real emails, you need an SMTP server (like SendGrid, Amazon SES, or a Gmail App Password). For local development, I propose using **Ethereal Email** via the `nodemailer` package. Ethereal automatically generates a fake email account and provides a URL in the console where you can view the "sent" email and click the verification link.
> 
> Are you okay using Ethereal Email for testing the verification flow now? You can easily swap it out for a real SMTP service later when you add a real database.

## Proposed Changes

---

### Dependencies

#### [NEW] `npm install bcryptjs nodemailer` & `npm install -D @types/bcryptjs @types/nodemailer`
- `bcryptjs`: Securely hashes user passwords.
- `nodemailer`: Sends verification emails to users upon registration.

---

### Core Authentication Logic

#### [MODIFY] [route.ts](file:///c:/Users/samph/.gemini/antigravity/scratch/f1-ai-app/src/app/api/auth/[...nextauth]/route.ts)
- Add NextAuth `CredentialsProvider`.
- Implement `authorize` to verify the user exists, the password matches, and `user.isVerified` is true. If not verified, throw an error.
- Keep the Google and GitHub providers as non-functional placeholders.
- Set custom pages: `pages: { signIn: '/login' }`.

#### [NEW] [users.ts](file:///c:/Users/samph/.gemini/antigravity/scratch/f1-ai-app/src/lib/users.ts)
- Utility functions for `data/users.json`.
- Schema: `{ id, email, passwordHash, isVerified, verificationToken }`
- Functions: `findUserByEmail`, `createUser`, `verifyUser`.

#### [NEW] [mailer.ts](file:///c:/Users/samph/.gemini/antigravity/scratch/f1-ai-app/src/lib/mailer.ts)
- Sets up `nodemailer` transport.
- Function `sendVerificationEmail(email, token)` that creates a test account via Ethereal and logs the email URL.

#### [NEW] [register/route.ts](file:///c:/Users/samph/.gemini/antigravity/scratch/f1-ai-app/src/app/api/auth/register/route.ts)
- Receives user email and password.
- Checks if the user already exists.
- Generates a random `verificationToken` and creates the user with `isVerified: false`.
- Calls `sendVerificationEmail()`.

#### [NEW] [verify/route.ts](file:///c:/Users/samph/.gemini/antigravity/scratch/f1-ai-app/src/app/api/auth/verify/route.ts)
- API endpoint that handles the email link click (e.g. `GET /api/auth/verify?token=XYZ`).
- Looks up the user by token, sets `isVerified: true`, and clears the token.
- Redirects the user to `/login?verified=true`.

---

### Frontend UI

#### [NEW] [register/page.tsx](file:///c:/Users/samph/.gemini/antigravity/scratch/f1-ai-app/src/app/register/page.tsx)
- A vibrant registration form matching the dark glassmorphic design.
- Collects email/password, validates them, and submits to the register API.
- Shows a "Check your email" success message upon submission.

#### [NEW] [login/page.tsx](file:///c:/Users/samph/.gemini/antigravity/scratch/f1-ai-app/src/app/login/page.tsx)
- A beautiful sign-in form using NextAuth's `signIn('credentials')`.
- Displays Google and GitHub buttons (non-functional for now).
- Shows verification errors or success messages.

#### [MODIFY] [page.tsx](file:///c:/Users/samph/.gemini/antigravity/scratch/f1-ai-app/src/app/page.tsx)
- Update the "Login" button href to point to `/login`.

## Verification Plan

### Automated Tests
- N/A

### Manual Verification
1. Navigate to `/register` and submit a valid email and password.
2. Check the terminal for the Ethereal Email URL and click it to view the "sent" email.
3. Attempt to sign in before verifying -> Should see "Please verify your email" error.
4. Click the link in the Ethereal email -> Should be redirected to `/login` with a success message.
5. Sign in successfully -> Should access the app.
