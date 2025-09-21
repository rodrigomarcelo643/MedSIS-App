# MedSIS App 

A React Native mobile application built with Expo for managing student information and academic resources.

## Project Structure

```
IntegratedProject/
├── app/                          # Main application screens (file-based routing)
│   ├── (tabs)/                   # Tab-based navigation screens
│   │   ├── _layout.tsx          # Tab layout configuration
│   │   ├── ai-assistant.tsx     # AI chatbot interface
│   │   ├── evaluations.tsx      # Student evaluations
│   │   ├── folder.tsx           # File management system
│   │   ├── home.tsx             # Dashboard/home screen
│   │   └── profile.tsx          # User profile management
│   ├── auth/                    # Authentication screens
│   │   ├── login.tsx            # Login interface
│   │   ├── otp-verification.tsx # Enhanced OTP verification with password requirements
│   │   └── policy-acceptance.tsx # Comprehensive privacy policy acceptance
│   ├── notifications/           # Notification screens
│   │   └── index.tsx            # Notifications with Philippine time and feedback handling
│   ├── screens/                 # Additional app screens
│   │   ├── announcements.tsx    # School announcements with lazy loading
│   │   ├── calendar.tsx         # Enhanced calendar with Philippine timezone
│   │   ├── change-password.tsx  # Password change functionality
│   │   ├── learning-materials.tsx # Educational resources
│   │   └── school-calendar.tsx   # Calendar details
│   ├── _layout.tsx              # Root layout configuration
│   └── +not-found.tsx           # 404 error page
├── assets/                      # Static assets
│   ├── fonts/                   # Custom fonts (Montserrat, SpaceMono)
│   ├── images/                  # App images and icons (including swu-head.png)
│   ├── sounds/                  # Notification sounds
│   └── styles/                  # Global styles and layouts
├── components/                  # Reusable UI components
│   ├── ui/                      # Platform-specific UI components
│   │   ├── IconSymbol.tsx       # Icon symbol components
│   │   ├── RotatingDots.tsx     # Loading animations
│   │   └── TabBarBackground.tsx # Tab bar styling
│   ├── Avatar.tsx               # User profile picture component
│   ├── Card.tsx                 # Reusable card layout component
│   ├── Input.tsx                # Form input components
│   ├── SplashScreen.tsx         # App loading screen
│   └── *.tsx                    # Other common components
├── constants/                   # App constants
│   └── Colors.ts                # Color definitions and themes
├── contexts/                    # React contexts
│   └── AuthContext.tsx          # Authentication state with live data fetching
├── hooks/                       # Custom React hooks
│   ├── useColorScheme.ts        # Theme management
│   └── useThemeColor.ts         # Color theme utilities
├── lib/                         # Utility functions
│   └── utils.ts                 # Common utility functions
├── services/                    # External services
│   └── notificationService.ts   # Push notification handling
├── scripts/                     # Build and utility scripts
│   └── reset-project.js         # Project reset utilities
├── android/                     # Android-specific configuration
│   ├── app/                     # Android app configuration
│   └── gradle/                  # Gradle build system
├── .expo/                       # Expo development files
├── Configuration files          # Package.json, tsconfig, etc.
├── global.css                   # Global CSS styles
├── tailwind.config.js           # Tailwind CSS configuration
└── nativewind-env.d.ts          # NativeWind type definitions
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
- **app/auth/otp-verification.tsx** - Two-factor authentication via OTP with enhanced password requirements
- **app/auth/policy-acceptance.tsx** - Comprehensive privacy policy and terms acceptance

### Additional Screens
- **app/screens/announcements.tsx** - Detailed view of school announcements with lazy loading and back-to-top navigation
- **app/screens/evaluations.tsx** - Student grade and evaluation management
- **app/screens/learning-materials.tsx** - Educational resources and materials
- **app/screens/calendar.tsx** - Enhanced calendar with accurate time alignment for Philippine timezone
- **app/notifications/index.tsx** - Push notification management with Philippine time conversion and feedback handling

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
- **State Management**: React Context API with live data fetching
- **UI Components**: Custom components with Lucide React icons
- **Image Handling**: Expo ImagePicker with fallback system
- **Time Management**: Philippine timezone integration
- **Data Loading**: Lazy loading and pagination support

## Features

### Authentication & Security
- 🔐 Enhanced OTP verification with strengthened password requirements
- 🔑 Password validation including uppercase, numbers, special characters, and length requirements
- 📋 Comprehensive privacy policy acceptance with detailed terms
- 🛡️ Secure session management with live data fetching

### User Experience
- 👤 Advanced profile management with live avatar fetching and SWU head fallback
- 📅 Accurate calendar system with Philippine timezone support
- 🔔 Smart notifications with feedback separation and time conversion
- 📁 Enhanced document management with image viewer improvements
- 📢 Announcements with lazy loading (10 items per batch) and back-to-top navigation

### Core Functionality
- 🤖 AI-powered student assistant
- 📊 Grade and evaluation tracking
- 📚 Learning materials access
- ⏰ Real-time calendar events with proper time alignment
- 🖼️ Image viewing without loading delays
- 🔄 Pull-to-refresh functionality across screens


## Recent Updates

### Version 2.0 Features
- ✅ Enhanced password security with number requirements
- ✅ Comprehensive privacy policy with detailed sections
- ✅ Philippine timezone integration for accurate time display
- ✅ Improved avatar system with SWU head fallback
- ✅ Lazy loading for announcements (10 items per batch)
- ✅ Back-to-top navigation for better UX
- ✅ Live data fetching with pull-to-refresh
- ✅ Enhanced notification system with feedback separation
- ✅ Improved calendar time alignment
- ✅ Optimized image loading and viewing

# MSIS - Medical Student Information System 📱
# Click the Link for the website version: https://msis.eduisync.io/
