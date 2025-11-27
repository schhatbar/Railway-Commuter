# Vercel Deployment Guide for Railway Commuter App

This guide covers deploying the Railway Commuter App to Vercel with Google Sign-In authentication.

## Prerequisites

1. A Vercel account ([vercel.com](https://vercel.com))
2. A Firebase project with Authentication enabled
3. Git repository connected to Vercel

## Step 1: Firebase Configuration

### 1.1 Enable Google Sign-In in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** > **Sign-in method**
4. Enable **Google** provider
5. Add your project support email

### 1.2 Add Vercel Domain to Authorized Domains

1. In Firebase Console, go to **Authentication** > **Settings** > **Authorized domains**
2. Add your Vercel deployment domains:
   - `your-app.vercel.app` (production domain)
   - `your-app-*.vercel.app` (preview deployments)
   - Any custom domains you're using

**Important:** Without adding these domains, Google Sign-In will fail with authorization errors.

### 1.3 Get Firebase Configuration

1. Go to **Project Settings** > **General**
2. Under "Your apps", find your web app or create one
3. Copy the Firebase configuration values:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

## Step 2: Deploy to Vercel

### 2.1 Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** > **Project**
3. Import your Git repository
4. Configure the project:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 2.2 Configure Environment Variables

Add the following environment variables in Vercel:

1. Go to **Project Settings** > **Environment Variables**
2. Add each variable (for Production, Preview, and Development):

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Security Note:** While these values are exposed in the client-side code, they are safe to include as environment variables. Firebase security is managed through Firestore Security Rules and Authentication settings.

### 2.3 Deploy

1. Click **Deploy**
2. Wait for the build to complete
3. Vercel will provide you with a deployment URL

## Step 3: Update Firebase with Final Domain

After your first deployment:

1. Note your Vercel deployment URL (e.g., `your-app.vercel.app`)
2. Go back to Firebase Console > **Authentication** > **Settings** > **Authorized domains**
3. Ensure your Vercel domain is added
4. If using a custom domain, add it as well

## Step 4: Test Google Sign-In

1. Visit your deployed Vercel app
2. Navigate to the Login or Register page
3. Click "Sign in with Google"
4. Complete the Google authentication flow
5. Verify successful login

## Troubleshooting

### Error: "auth/unauthorized-domain"

**Cause:** Your Vercel domain is not authorized in Firebase.

**Solution:**
1. Go to Firebase Console > Authentication > Settings > Authorized domains
2. Add your Vercel domain (e.g., `your-app.vercel.app`)
3. Include preview domains: `your-app-*.vercel.app`
4. Wait a few minutes for changes to propagate

### Error: Firebase configuration not found

**Cause:** Environment variables not set correctly in Vercel.

**Solution:**
1. Check that all `VITE_FIREBASE_*` variables are set in Vercel
2. Ensure variables are set for the correct environment (Production/Preview/Development)
3. Redeploy after adding variables

### Google Sign-In popup blocked

**Cause:** Browser popup blocker or CSP headers.

**Solution:**
- The `vercel.json` already includes correct CSP headers for Google OAuth
- Ask users to allow popups for your domain
- Check browser console for CSP violations

### CORS errors with Firebase

**Cause:** Incorrect CSP or network configuration.

**Solution:**
- Verify `vercel.json` includes Firebase domains in CSP `connect-src`
- Check Firebase project settings
- Ensure Firebase Auth domain matches your configuration

## Security Headers

The app includes security headers configured in `vercel.json`:

- **Content-Security-Policy:** Allows Google OAuth and Firebase domains
- **X-Frame-Options:** Prevents clickjacking
- **X-Content-Type-Options:** Prevents MIME sniffing
- **Permissions-Policy:** Restricts browser features
- **Cache-Control:** Optimizes asset caching

## Custom Domains

To use a custom domain:

1. In Vercel, go to **Project Settings** > **Domains**
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
4. Add the custom domain to Firebase Authorized domains
5. Update any OAuth redirect URIs if needed

## Continuous Deployment

Vercel automatically deploys:
- **Production:** Commits to your main branch
- **Preview:** Pull requests and other branches
- Each preview deployment gets a unique URL

Remember to add the preview domain pattern (`*.vercel.app`) to Firebase authorized domains.

## Monitoring

Monitor your deployment:
- **Vercel Dashboard:** Build logs, runtime logs, analytics
- **Firebase Console:** Authentication events, user management
- **Browser Console:** Client-side errors

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev/)
