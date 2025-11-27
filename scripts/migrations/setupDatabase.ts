import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';
import { trainsData } from './seedData';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

/**
 * Seed trains collection with sample data
 */
async function seedTrains() {
  console.log(`\n${colors.blue}📊 Seeding trains collection...${colors.reset}`);

  let createdCount = 0;
  let skippedCount = 0;

  for (const train of trainsData) {
    try {
      const trainRef = doc(db, 'trains', train.trainNumber);
      const trainDoc = await getDoc(trainRef);

      if (!trainDoc.exists()) {
        await setDoc(trainRef, train);
        console.log(`${colors.green}✓${colors.reset} Created train: ${train.trainName} (${train.trainNumber})`);
        createdCount++;
      } else {
        console.log(`${colors.yellow}⊘${colors.reset} Skipped train: ${train.trainName} (${train.trainNumber}) - already exists`);
        skippedCount++;
      }
    } catch (error) {
      console.error(`${colors.red}✗${colors.reset} Error creating train ${train.trainNumber}:`, error);
    }
  }

  console.log(`\n${colors.green}✓ Trains seeding complete!${colors.reset}`);
  console.log(`  Created: ${createdCount}`);
  console.log(`  Skipped: ${skippedCount}`);
}

/**
 * Create indexes for better query performance
 * Note: This is informational - indexes need to be created in Firebase Console or using Firebase CLI
 */
function displayIndexRecommendations() {
  console.log(`\n${colors.blue}📑 Recommended Firestore Indexes:${colors.reset}`);
  console.log(`\n1. Messages Collection:`);
  console.log(`   - Fields: groupId (Ascending), timestamp (Ascending)`);
  console.log(`   - Query scope: Collection`);
  console.log(`\n2. Groups Collection:`);
  console.log(`   - Fields: isActive (Ascending), createdAt (Descending)`);
  console.log(`   - Query scope: Collection`);
  console.log(`\n${colors.yellow}Note: Create these indexes in Firebase Console under Firestore > Indexes${colors.reset}`);
}

/**
 * Check database connectivity and display collection stats
 */
async function checkDatabaseStatus() {
  console.log(`\n${colors.blue}🔍 Checking database status...${colors.reset}`);

  const collections = ['users', 'trains', 'groups', 'messages'];

  for (const collectionName of collections) {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      console.log(`${colors.green}✓${colors.reset} Collection '${collectionName}': ${snapshot.size} documents`);
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        console.log(`${colors.yellow}⊘${colors.reset} Collection '${collectionName}': Access denied (this is normal if no documents exist yet)`);
      } else {
        console.log(`${colors.red}✗${colors.reset} Collection '${collectionName}': Error - ${error.message}`);
      }
    }
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log(`${colors.blue}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║   Railway Commuter Database Setup     ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════╝${colors.reset}`);

  try {
    // Verify Firebase configuration
    if (!firebaseConfig.projectId) {
      throw new Error('Firebase configuration is missing. Please check your .env file.');
    }

    console.log(`\n${colors.green}✓ Firebase connected${colors.reset}`);
    console.log(`  Project ID: ${firebaseConfig.projectId}`);

    // Check current database status
    await checkDatabaseStatus();

    // Seed trains data
    await seedTrains();

    // Display index recommendations
    displayIndexRecommendations();

    console.log(`\n${colors.green}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.green}║     Migration completed successfully!  ║${colors.reset}`);
    console.log(`${colors.green}╚════════════════════════════════════════╝${colors.reset}\n`);

    process.exit(0);
  } catch (error: any) {
    console.error(`\n${colors.red}✗ Migration failed:${colors.reset}`, error.message);
    console.error(`\n${colors.yellow}Please ensure:${colors.reset}`);
    console.error(`  1. Your .env file contains all required Firebase credentials`);
    console.error(`  2. Firebase Authentication is enabled in your Firebase Console`);
    console.error(`  3. Firestore Database is created and security rules are deployed`);
    process.exit(1);
  }
}

// Run migration
runMigration();
