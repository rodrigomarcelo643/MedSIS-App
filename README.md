# MedSIS App - Medical Student Information System 📱

<!-- Version Badges -->
<div align="center" style="margin-bottom: 30px;">
  <img src="https://img.shields.io/badge/Expo-~54.0.23-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo Version" />
  <img src="https://img.shields.io/badge/React%20Native-0.79.6-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React Native Version" />
  <img src="https://img.shields.io/badge/TypeScript-~5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Version" />
  <img src="https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React Version" />
  <img src="https://img.shields.io/badge/NativeWind-^4.1.23-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="NativeWind Version" />
  <img src="https://img.shields.io/badge/Version-1.0.0-brightgreen?style=for-the-badge" alt="App Version" />
  <img src="https://img.shields.io/badge/PHP-8.3-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP Version" />
  <img src="https://img.shields.io/badge/Axios-^1.11.0-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios Version" />
  <img src="https://img.shields.io/badge/Context%20API-React-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="Context API" />
</div>

<!-- Project Images -->
<div align="center" style="display: flex; justify-content: center; align-items: center; gap: 15px; margin: 30px 0 40px 0;">
  <img src="https://msis.eduisync.io/msis/MSIS-ADMIN/assets/images/mockup.png" alt="Far Left Image" style="width: 150px; height: 250px; object-fit: contain; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
  <img src="https://msis.eduisync.io/msis/MSIS-ADMIN/assets/images/mockup2.png" alt="Left Image" style="width: 150px; height: 250px; object-fit: contain; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
  <img src="https://msis.eduisync.io/mockup1.png" alt="MedSIS App" style="width: 200px; height: 350px; object-fit: contain; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
  <img src="https://msis.eduisync.io/msis/MSIS-ADMIN/assets/images/mockup3.png" alt="Right Image" style="width: 150px; height: 250px; object-fit: contain; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
  <img src="https://msis.eduisync.io/msis/MSIS-ADMIN/assets/images/mockup4.png" alt="Far Right Image" style="width: 150px; height: 250px; object-fit: contain; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
</div>

A comprehensive mobile application designed specifically for medical students to upload academic requirements, view evaluation results history, and manage their educational journey. This first version release focuses on streamlined document submission, evaluation tracking, and essential academic tools with AI assistance and real-time communication features.

## Project Structure

```
MedSIS-App/
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
│   ├── chat/                    # Chat and messaging screens
│   │   └── [id].tsx             # Individual chat conversation screen
│   ├── chat-info/               # Chat information screens
│   │   └── [id].tsx             # Chat details and media sharing
│   ├── notifications/           # Notification screens
│   │   └── index.tsx            # Notifications with Philippine time and feedback handling
│   ├── screens/                 # Additional app screens
│   │   ├── announcements.tsx    # School announcements with lazy loading
│   │   ├── calendar.tsx         # Enhanced calendar with Philippine timezone
│   │   ├── change-password.tsx  # Password change functionality
│   │   ├── learning-materials.tsx # Educational resources
│   │   ├── messages.tsx         # Messages and conversations management
│   │   ├── school-calendar.tsx   # Calendar details
│   │   └── test-results.tsx     # Test results dashboard with visual stats
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
├── constants/                   # App constants and configuration
│   ├── Colors.ts                # Color definitions and themes
│   └── Config.ts                # Centralized API configuration
├── contexts/                    # React contexts
│   ├── AuthContext.tsx          # Authentication state with live data fetching
│   └── ThemeContext.tsx         # Theme management and dark/light mode
├── hooks/                       # Custom React hooks
│   ├── useColorScheme.ts        # Theme management
│   └── useThemeColor.ts         # Color theme utilities
├── lib/                         # Utility functions
│   └── utils.ts                 # Common utility functions
├── services/                    # External services
│   ├── messageService.ts        # Real-time messaging and chat functionality
│   └── notificationService.ts   # Push notification handling
├── tests/                       # Comprehensive test suite
│   ├── auth/                    # Authentication tests
│   ├── screens/                 # Screen component tests
│   ├── services/                # Service layer tests
│   ├── components/              # UI component tests
│   ├── utils/                   # Utility function tests
│   └── test-runner.ts           # Test execution and reporting
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

- **app/\_layout.tsx** - Root layout with navigation setup and authentication checks
- **app/(tabs)/\_layout.tsx** - Tab navigation configuration with custom styling
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

### Messaging & Communication

- **app/screens/messages.tsx** - Messages and conversations management with real-time updates
- **app/chat/[id].tsx** - Individual chat conversation screen with message handling
- **app/chat-info/[id].tsx** - Chat details, media sharing, and user information

### Additional Screens

- **app/screens/announcements.tsx** - Detailed view of school announcements with lazy loading and back-to-top navigation
- **app/screens/evaluations.tsx** - View evaluation results history and evaluator e-signatures
- **app/screens/learning-materials.tsx** - Educational resources and materials
- **app/screens/calendar.tsx** - Enhanced calendar with accurate time alignment for Philippine timezone
- **app/screens/test-results.tsx** - Visual test results dashboard with pass/fail statistics
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

## Testing

1. Generate test report

   ```bash
   node tests/test-runner.js
   ```

2. View test files
   ```bash
   # Test files are available in tests/ directory
   # - tests/auth/ - Authentication tests
   # - tests/screens/ - Screen functionality tests
   # - tests/services/ - API service tests
   ```

**Test Coverage**: 100% (All tests passing)

- ✅ Authentication, Messaging, Chat, Profile, Services
- ✅ UI Components, Validation, Error Handling
- ✅ Edge Cases, Performance Optimization
- ✅ Constants-based configuration testing
- ✅ API integration with centralized config
- ✅ Cross-platform compatibility testing

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
- **Configuration**: Centralized API configuration management
- **Testing**: Comprehensive test suite with constants-based configuration

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
- 💬 Real-time messaging and chat system with live updates
- 📊 View evaluation results history with evaluator e-signatures
- 📚 Learning materials access and download
- ⏰ Real-time calendar events with proper time alignment
- 🖼️ Image viewing without loading delays
- 🔄 Pull-to-refresh functionality across screens
- ⚙️ Centralized configuration management
- 🌙 Dark/Light theme support
- 📱 Cross-platform compatibility (iOS/Android)

## Version 1.0.0 - First Release

### Core Features

- ✅ Student requirement upload system with document management
- ✅ View evaluation results history and evaluator e-signatures
- ✅ Secure authentication with OTP verification
- ✅ Real-time messaging and communication system
- ✅ AI-powered student assistant for academic support
- ✅ Philippine timezone integration for accurate scheduling
- ✅ Dark/Light theme support
- ✅ Comprehensive privacy policy and terms acceptance
- ✅ Academic calendar with events and deadlines
- ✅ Grade tracking and performance analytics
- ✅ Push notification system with feedback handling
- ✅ File management and document organization
- ✅ Profile management with avatar system
- ✅ Centralized API configuration management
- ✅ Cross-platform compatibility (iOS/Android)
- ✅ Comprehensive test suite with 100% coverage
- ✅ NativeWind styling for consistent UI/UX
- ✅ TypeScript implementation for type safety

# MSIS - Medical Student Information System 📱

# Click the Link for the website version: https://msis.eduisync.io/
