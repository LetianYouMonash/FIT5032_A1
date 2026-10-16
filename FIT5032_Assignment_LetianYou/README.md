# Recycling & Reuse

A web application developed for **FIT5032 Assignment**, built with Vue 3, Vite, Bootstrap and Firebase.

The application aims to promote environmental awareness by providing recycling information, educational resources, interactive features and user account management.

## Features

- **Firebase Authentication:** Supports user registration, login and logout.
- **Homepage:** Provides an overview of the application and access to its main features.
- **Recycling Guide:** Displays recycling information, interactive tables and user ratings.
- **Interactive Map:** Uses Leaflet to display recycling-related locations.
- **Learning Centre:** Provides recycling tips and interactive quizzes.
- **Environmental News:** Allows users to browse, search and filter environmental news.
- **Email Resource Sharing:** Sends emails with file attachments using SendGrid.
- **User Profile:** Allows users to view and update account information.
- **Admin Dashboard:** Supports user account management with role-based access control.
- **Data Export:** Supports CSV and PDF exports.
- **Navigation and Accessibility:** Includes responsive navigation, a back-to-top button and accessibility improvements.

## Technologies Used

- Vue 3 (Composition API)
- Vite
- JavaScript
- Bootstrap
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting
- Firebase Cloud Functions
- Leaflet
- Node.js
- SendGrid API

## Installation

**Requirements:** Node.js 22.18 or later in the 22.x series, or Node.js 24.12 or later.

1. Clone or download the project.
2. Open the project directory containing `package.json`.
3. Install dependencies:

```bash
npm ci
```

4. Copy `.env.example` to `.env.local` and configure Firebase:

```dotenv
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

5. Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

## Backend Configuration

Some features require backend services, including email sending, ratings and administrator account management.

Copy `.env.server.example` to `.env.server.local` and configure the required Firebase and SendGrid settings.

For local development, start the backend in a separate terminal:

```bash
npm run server
```

Keep both the frontend and backend running when testing API-dependent features.

**Security:** Never commit private service account credentials, SendGrid API keys or local environment files containing secrets.

## Authentication and Database

Firebase Authentication manages user registration and login.

Administrator permissions are controlled using Firebase custom claims. Regular users cannot access administrator-only operations.

Cloud Firestore stores application ratings. The backend handles rating submissions and calculations.

## Email Functionality

The application uses SendGrid to send emails with attachments.

Supported attachment formats include PDF, TXT, PNG and JPG, with a maximum file size of 2 MB.

A valid Firebase session is required to use this feature.

## Build and Deployment

Build the application for production:

```bash
npm run build
```

The production files are generated in the `dist` directory.

Deploy the frontend using Firebase Hosting:

```bash
firebase deploy --only hosting
```

Backend services and Cloud Functions must be configured and deployed separately when their code changes.

## Accessibility

The application includes responsive layouts, accessible form labels, keyboard navigation, focus indicators and a back-to-top button to improve usability.

## Project Information

**Unit:** FIT5032

**Assessment:** Assignment

**Framework:** Vue 3

**Hosting:** Firebase Hosting

**Purpose:** Educational project focused on recycling, reuse and environmental awareness.