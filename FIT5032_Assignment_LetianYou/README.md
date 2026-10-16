# Recycling & Reuse

A Vue 3 application for FIT5032 Assignment 1, using the Composition API, Bootstrap and Firebase Authentication.

## Setup

Use Node.js 22.18 or later in the 22.x series, or Node.js 24.12 or later.
Run these commands from this directory, which contains `package.json`:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite.

## Firebase configuration

Copy `.env.example` to `.env.local` and enter the values from your Firebase Web app configuration:

```dotenv
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

Enable Email/Password in Firebase Console under Authentication. Check that the development and deployed domains are included in Authentication's authorized domains.
Restart the development server after changing `.env.local`.

`.env.local` is ignored by Git. A fresh checkout needs its own configuration. These variables contain public Web app configuration; do not place service account credentials or private keys in them.

## Accounts and ratings

All application sign-in and registration use Firebase Authentication. Existing browser-local account data is retained but is no longer used for access. Firebase accounts are not automatically created from old local accounts.

Administrator roles use the Firebase custom claim `admin: true`. New registrations are ordinary users. The backend checks both a verified, non-revoked ID token and the current account role before listing or deleting users. Administrator accounts cannot be deleted through the application.

To configure account management:

1. Save a Firebase service account JSON outside the repository. It must belong to the configured Firebase project and have permissions to manage Firebase Authentication users.
2. Set `GOOGLE_APPLICATION_CREDENTIALS` in `.env.server.local` to its absolute path (forward slashes are accepted on Windows). Never put this credential in a `VITE_` variable.
3. Run `npm run admin:grant -- letianyou@gmail.com` once to assign the selected existing account. The script preserves other custom claims.
4. Restart `npm run server`, then sign out and sign in again on the website to refresh role claims.
5. Confirm the administrator can list users and an ordinary account cannot access administrator APIs.

Firebase sessions persist across refreshes in the current tab. Ratings still use browser local storage and are not synchronized between devices. Deleting a cloud account does not yet remove that user's stored ratings. Account migration does not migrate local passwords or ratings.

## Email attachments

The email form calls a Node.js API that verifies Firebase ID tokens and sends attachments through SendGrid. Sign in with a Firebase account to use it; browser-local accounts cannot authenticate to this API.

1. Create a SendGrid account and verify a sender email under Sender Authentication.
2. Create an API key with Mail Send permission. Keep the key on the server, never in a `VITE_` variable or source file.
3. Copy `.env.server.example` to `.env.server.local`. Set `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` (the verified sender), and `FIREBASE_PROJECT_ID` (the same project as the Web app).
4. Run `npm run server` in one terminal and `npm run dev` in another, both from this directory. Restart the API after changing its environment file.
5. Open **Email a resource**, enter a recipient, subject and message, and attach one PDF, UTF-8 TXT, PNG or JPG file up to 2 MB. Use a simple English filename.
6. Click **Send email**. A successful response means SendGrid accepted the message. Confirm delivery in the recipient inbox or spam folder, and open the attachment to verify its contents.

The API limits each account to five sending attempts per hour, at least one minute apart, and all accounts together to thirty attempts per hour. Limits are held in memory and reset when the API restarts. Use shared persistent limits before running multiple API instances. File checks validate format and size; they do not perform malware scanning.

The server verifies token signatures, expiry and project identity. This verification does not immediately detect revoked sessions or deleted accounts; an already-issued token may remain valid until expiry. It does not grant account administration permissions.

Vite proxies `/api` to `http://127.0.0.1:3001` during development and preview. The API is a separate service and is not included in `dist`. For deployment, run the API on a server and route `/api` to it over HTTPS. Static hosting alone cannot send these emails. The account management routes require service account credentials; the mail route uses token signature verification.

References: [SendGrid Mail Send API](https://www.twilio.com/docs/sendgrid/api-reference/mail-send/mail-send), [Firebase ID token verification](https://firebase.google.com/docs/auth/admin/verify-id-tokens).

## Build

```sh
npm run build
npm run preview
```

The production build is written to `dist`. Firebase configuration must be available when building.
