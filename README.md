# Railway Commuter App 🚂

A mobile-responsive web application that helps railway commuters locate their exact cabin/coach and seat on the train platform, and share this information with travel groups.

## Features

### 🔐 User Authentication
- Email/password login and registration
- Google Sign-in integration
- User profile management with frequent routes

### 🚆 Train & Seat Selection
- Search trains by route/number/name
- Select coach/cabin (e.g., S1, S2, A1, B1)
- Select seat number
- Visual platform map showing where selected coach will stop
- Real-time visualization of cabin position on platform

### 📍 Platform Visualization
- Interactive platform layout using SVG
- Train formation display (engine, coaches in sequence)
- Highlighted user's selected cabin
- Platform markers (entrance, exit, stairs, lifts)
- Distance indicators from nearest platform entry point

### 👥 Group Features
- Create travel groups with unique 6-digit group code
- Join groups using invite code
- View group members' cabin/coach and seat numbers
- Real-time location visualization on platform map
- Group chat for coordination
- Leave/delete group functionality

### ⚡ Additional Features
- Save favorite routes
- Mobile-first responsive design
- PWA support for mobile installation
- Real-time updates for group members
- Color-coded coaches (AC, Sleeper, General, First Class)

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM 7
- **Backend/Database**: Firebase
  - Firestore (Database)
  - Authentication
  - Real-time listeners
- **PWA**: Vite PWA Plugin

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Firebase project

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Railway-Commuter.git
cd Railway-Commuter
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

#### a. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" and follow the setup wizard
3. Enable Google Analytics (optional)

#### b. Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password**
3. Enable **Google** sign-in provider
4. Add your domain to authorized domains

#### c. Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create Database**
3. Start in **production mode** (we'll add security rules later)
4. Choose a location close to your users

#### d. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** > **General**
2. Scroll down to "Your apps" and click the web icon `</>`
3. Register your app
4. Copy the Firebase configuration object

### 4. Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Open `.env` and add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Deploy Firestore Security Rules

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login to Firebase:

```bash
firebase login
```

3. Initialize Firebase in your project:

```bash
firebase init firestore
```

- Select your Firebase project
- Accept default for Firestore rules file (`firestore.rules`)
- Accept default for Firestore indexes file

4. Deploy security rules:

```bash
firebase deploy --only firestore:rules
```

### 6. Add Sample Train Data

The app includes sample Indian railway train data. To upload it to Firestore:

1. Start the development server:

```bash
npm run dev
```

2. Open the browser console and run:

```javascript
import { uploadSampleTrainData } from './src/utils/sampleTrainData';
uploadSampleTrainData();
```

Or create a temporary page/component to call this function once.

**Note**: In a production environment, you would typically add train data through an admin panel or import script using Firebase Admin SDK.

### 7. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment

### Deploy to Firebase Hosting

1. Initialize Firebase Hosting:

```bash
firebase init hosting
```

2. Configure hosting:
   - Public directory: `dist`
   - Single-page app: `Yes`
   - Automatic builds with GitHub: `No` (or `Yes` if you want)

3. Build and deploy:

```bash
npm run build
firebase deploy --only hosting
```

### Deploy to Vercel

1. Push your code to GitHub

2. Go to [Vercel](https://vercel.com) and sign in with GitHub

3. Click "Add New Project" and import your repository

4. Configure your project:
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

5. Add Environment Variables:
   Click on "Environment Variables" and add all Firebase configuration variables:
   ```
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

6. Click "Deploy"

7. After deployment, update Firebase Authentication:
   - Go to Firebase Console > Authentication > Settings > Authorized domains
   - Add your Vercel domain (e.g., `your-app.vercel.app`)

**Note**: The `vercel.json` file is already configured for proper SPA routing and security headers.

### Deploy to Other Platforms

The app can also be deployed to:
- **Netlify**: Connect your GitHub repo
- **AWS Amplify**: Follow AWS Amplify deployment guide
- Any static hosting service

## Project Structure

```
Railway-Commuter/
├── public/                 # Public assets
├── src/
│   ├── components/        # Reusable React components
│   │   ├── LoadingSpinner.tsx
│   │   ├── Navbar.tsx
│   │   ├── PlatformVisualization.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── TrainSearch.tsx
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx
│   ├── firebase/          # Firebase configuration and services
│   │   ├── config.ts
│   │   └── services.ts
│   ├── pages/             # Page components
│   │   ├── CreateGroup.tsx
│   │   ├── Dashboard.tsx
│   │   ├── GroupDetail.tsx
│   │   ├── Groups.tsx
│   │   ├── JoinGroup.tsx
│   │   ├── Login.tsx
│   │   ├── Profile.tsx
│   │   └── Register.tsx
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   └── sampleTrainData.ts
│   ├── App.tsx            # Main App component
│   ├── index.css          # Global styles
│   └── main.tsx           # Entry point
├── .env.example           # Example environment variables
├── .gitignore
├── firestore.rules        # Firestore security rules
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Firebase Collections Structure

### Users Collection

```typescript
{
  userId: string,
  email: string,
  displayName: string,
  phoneNumber: string,
  frequentRoutes: FrequentRoute[],
  createdAt: Timestamp
}
```

### Trains Collection

```typescript
{
  trainNumber: string,
  trainName: string,
  route: string,
  coaches: Coach[]
}
```

### Groups Collection

```typescript
{
  groupId: string,
  groupName: string,
  groupCode: string,      // 6-digit code
  createdBy: string,      // userId
  members: GroupMember[],
  trainNumber: string,
  route: string,
  journeyDate: Timestamp,
  createdAt: Timestamp,
  isActive: boolean
}
```

### Messages Collection

```typescript
{
  messageId: string,
  groupId: string,
  userId: string,
  userName: string,
  message: string,
  timestamp: Timestamp
}
```

## Security

The app implements Firebase Security Rules to ensure:
- Users can only read/write their own data
- Group members can read group data
- Only group creators can delete groups
- Messages are only accessible to group members

See `firestore.rules` for complete security rules.

## PWA Support

The app is configured as a Progressive Web App (PWA):
- Installable on mobile devices
- Offline support for cached routes
- Service worker for background sync
- Responsive design optimized for mobile

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Known Issues and Limitations

1. Real-time platform positions are simulated (in production, integrate with actual railway APIs)
2. Train data needs to be manually populated (use admin SDK for bulk imports)
3. Notifications are not yet implemented (future enhancement)

## Future Enhancements

- [ ] Push notifications for group updates
- [ ] Live train tracking integration
- [ ] Platform change alerts
- [ ] Journey history
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Train delay notifications
- [ ] Seat availability checking

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: support@railwaycommuter.app (example)

## Acknowledgments

- Built with React and Firebase
- Icons from Heroicons
- Inspired by the need for better railway travel coordination

---

**Happy Commuting! 🚂**