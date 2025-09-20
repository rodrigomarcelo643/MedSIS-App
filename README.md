# MedSIS App 

A React Native mobile application built with Expo for managing student information and academic resources.

## Project Structure

```
MedSIS App/
├── app/                          # Main application screens (file-based routing)
│   ├── (tabs)/                   # Tab-based navigation screens
│   │   ├── _layout.tsx          # Tab layout configuration
│   │   ├── ai-assistant.tsx     # AI chatbot interface
│   │   ├── calendar.tsx         # Academic calendar view
│   │   ├── folder.tsx           # File management system
│   │   ├── home.tsx             # Dashboard/home screen
│   │   └── profile.tsx          # User profile management
│   ├── auth/                    # Authentication screens
│   │   ├── login.tsx            # Login interface
│   │   ├── otp-verification.tsx # OTP verification
│   │   └── policy-acceptance.tsx # Terms acceptance
│   ├── notifications/           # Notification screens
│   │   └── index.tsx            # Notifications list
│   ├── screens/                 # Additional app screens
│   │   ├── announcements.tsx    # School announcements
│   │   ├── evaluations.tsx      # Student evaluations
│   │   ├── learning-materials.tsx # Educational resources
│   │   └── school-calendar.tsx   # Calendar details
│   ├── _layout.tsx              # Root layout configuration
│   └── +not-found.tsx           # 404 error page
├── assets/                      # Static assets
│   ├── fonts/                   # Custom fonts
│   ├── images/                  # App images and icons
│   └── styles/                  # Global styles
├── components/                  # Reusable UI components
│   ├── ui/                      # Platform-specific UI components
│   └── *.tsx                    # Common components (Avatar, Card, etc.)
├── constants/                   # App constants
│   └── Colors.ts                # Color definitions
├── contexts/                    # React contexts
│   └── AuthContext.tsx          # Authentication state management
├── hooks/                       # Custom React hooks
├── lib/                         # Utility functions
├── android/                     # Android-specific configuration
└── Configuration files          # Package.json, tsconfig, etc.
```

## Key Files Explained

### Core Application
- **app/_layout.tsx** - Root layout with navigation setup and authentication checks
- **app/(tabs)/_layout.tsx** - Tab navigation configuration with custom styling
- **contexts/AuthContext.tsx** - Global authentication state and user session management

### Main Features
- **app/(tabs)/home.tsx** - Dashboard with announcements, quick actions, and academic overview
- **app/(tabs)/profile.tsx** - User profile with editable personal and academic information
- **app/(tabs)/ai-assistant.tsx** - AI-powered chatbot for student assistance
- **app/(tabs)/folder.tsx** - Document management and file organization system
- **app/(tabs)/calendar.tsx** - Academic calendar with events and schedules

### Authentication Flow
- **app/auth/login.tsx** - Student login with ID and password
- **app/auth/otp-verification.tsx** - Two-factor authentication via OTP
- **app/auth/policy-acceptance.tsx** - Terms and conditions acceptance

### Additional Screens
- **app/screens/announcements.tsx** - Detailed view of school announcements
- **app/screens/evaluations.tsx** - Student grade and evaluation management
- **app/screens/learning-materials.tsx** - Educational resources and materials
- **app/notifications/index.tsx** - Push notification management

### UI Components
- **components/ui/** - Platform-specific components for iOS/Android
- **components/Avatar.tsx** - User profile picture component
- **components/Card.tsx** - Reusable card layout component
- **components/SplashScreen.tsx** - App loading screen

## Get Started

1. Install dependencies
   ```bash
   npm install
   ```

2. Start the development server
   ```bash
   npx expo start
   ```

3. Run on device/emulator
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app

## Technology Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **UI Components**: Custom components with Lucide React icons

## Features

- 🔐 Secure authentication with OTP verification
- 👤 Comprehensive user profile management
- 📅 School and Events calendar integration
- 🤖 AI-powered student assistant
- 📁 Document and file management
- 📢 Real-time announcements
- 📊 Grade and evaluation tracking
- 📚 Learning materials access
- 🔔 Push notifications


# MSIS - Medical Student Information System 📱
# Click the Link for the website version  https://msis.eduisync.io/
