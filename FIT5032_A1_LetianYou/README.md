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

- Local accounts are stored in browser local storage. The first local account is assigned the administrator role. The admin panel manages local accounts only.
- Firebase accounts use email/password authentication and have the user role in this application. Manage these accounts through Firebase Console.
- Local roles are not server-enforced authorization. Cloud data requires server-side access controls.
- Firebase sessions persist across refreshes in the current tab.
- Ratings remain in browser local storage. Local and Firebase ratings are stored separately; ratings are not synchronized between devices.
- Deleting a local account removes its local ratings. Deleting a Firebase account in the console does not automatically remove its browser-stored ratings.

## Build

```sh
npm run build
npm run preview
```

The production build is written to `dist`. Firebase configuration must be available when building.
