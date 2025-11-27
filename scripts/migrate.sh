#!/bin/bash

# Railway Commuter Database Migration Script
# This script runs the database setup and seeding

set -e

echo "🚂 Railway Commuter Database Migration"
echo "========================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your Firebase credentials."
    echo ""
    echo "Required variables:"
    echo "  VITE_FIREBASE_API_KEY=your-api-key"
    echo "  VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain"
    echo "  VITE_FIREBASE_PROJECT_ID=your-project-id"
    echo "  VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket"
    echo "  VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id"
    echo "  VITE_FIREBASE_APP_ID=your-app-id"
    echo "  VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "✓ Environment variables loaded"
echo ""

# Check if tsx is installed
if ! command -v tsx &> /dev/null; then
    echo "📦 Installing tsx..."
    npm install -D tsx
fi

# Run the migration
echo "🚀 Running database migration..."
echo ""

tsx scripts/migrations/setupDatabase.ts

echo ""
echo "✅ Migration script completed!"
