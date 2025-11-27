# Database Migrations

This directory contains database migration scripts for the Railway Commuter application.

## Overview

The migration system sets up your Firestore database with:
- Collections structure (users, trains, groups, messages)
- Seed data for trains collection
- Database status checks
- Index recommendations

## Prerequisites

Before running migrations, ensure you have:

1. **Firebase Project Setup**
   - Created a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enabled Authentication (Email/Password and Google Sign-In)
   - Created a Firestore Database

2. **Environment Variables**
   - Created a `.env` file in the project root
   - Added all required Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

3. **Dependencies Installed**
   ```bash
   npm install
   ```

## Running Migrations

### Option 1: Using npm scripts (Recommended)

```bash
# Run complete database setup
npm run db:setup

# Or run migration directly with tsx
npm run db:migrate

# Seed data (same as migrate)
npm run db:seed
```

### Option 2: Using the bash script

```bash
# Make script executable (if not already)
chmod +x scripts/migrate.sh

# Run the migration
./scripts/migrate.sh
```

### Option 3: Direct execution

```bash
# Using tsx
npx tsx scripts/migrations/setupDatabase.ts
```

## What the Migration Does

### 1. Validates Configuration
- Checks if Firebase credentials are properly configured
- Verifies connection to Firebase project

### 2. Seeds Trains Collection
- Adds 10 sample Indian Railway trains with:
  - Train number, name, route
  - Departure and arrival times
  - Cabin and seat configuration
- **Idempotent**: Won't duplicate trains if already exist

### 3. Database Status Check
Shows the current state of all collections:
- users
- trains
- groups
- messages

### 4. Index Recommendations
Displays recommended Firestore composite indexes for optimal query performance.

## Collections Structure

### `users`
```typescript
{
  userId: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  frequentRoutes: string[];
  createdAt: Timestamp;
}
```

### `trains`
```typescript
{
  trainNumber: string;
  trainName: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  totalCabins: number;
  seatsPerCabin: number;
}
```

### `groups`
```typescript
{
  groupId: string;
  groupCode: string;
  trainNumber: string;
  date: string;
  createdBy: string;
  members: GroupMember[];
  isActive: boolean;
  createdAt: Timestamp;
}
```

### `messages`
```typescript
{
  messageId: string;
  groupId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Timestamp;
}
```

## Customizing Seed Data

To add or modify train data:

1. Edit `scripts/migrations/seedData.ts`
2. Add/modify entries in the `trainsData` array
3. Run the migration again

```typescript
export const trainsData: Omit<Train, 'trainNumber'>[] = [
  {
    trainName: 'Your Train Name',
    route: 'Start - Destination',
    trainNumber: '12345',
    departureTime: '10:00',
    arrivalTime: '18:00',
    totalCabins: 15,
    seatsPerCabin: 72
  },
  // Add more trains...
];
```

## Creating Indexes

After running the migration, create the recommended indexes in Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Indexes**
4. Click **Add index** and create:

   **Messages Index:**
   - Collection ID: `messages`
   - Field 1: `groupId` (Ascending)
   - Field 2: `timestamp` (Ascending)
   - Query scope: Collection

   **Groups Index:**
   - Collection ID: `groups`
   - Field 1: `isActive` (Ascending)
   - Field 2: `createdAt` (Descending)
   - Query scope: Collection

## Troubleshooting

### Error: Firebase configuration is missing
- Check your `.env` file exists and contains all required variables
- Ensure variables are prefixed with `VITE_`

### Error: Permission denied
- Verify Firestore security rules are deployed
- Check that Authentication is enabled
- Make sure you're using admin credentials or have proper permissions

### Error: Collection not found
- This is normal if collections don't have any documents yet
- Collections are created automatically when first document is added

### Trains not appearing
- Check Firebase Console → Firestore Database → trains collection
- Verify your Firestore security rules allow read access to trains
- Ensure the migration script completed successfully

## Security Rules

Security rules are defined in `firestore.rules` at the project root. Deploy them using:

```bash
# Using Firebase CLI
firebase deploy --only firestore:rules
```

## Adding New Migrations

To add new migration scripts:

1. Create a new file in `scripts/migrations/`
2. Follow the same pattern as `setupDatabase.ts`
3. Add the script to `package.json` scripts
4. Document it in this README

## Notes

- Migrations are **idempotent** - safe to run multiple times
- Existing data will not be overwritten
- Always backup your database before running migrations in production
- Test migrations in a development environment first

## Support

For issues or questions:
- Check the [Firebase Documentation](https://firebase.google.com/docs)
- Review Firestore security rules
- Check the application logs for detailed error messages
