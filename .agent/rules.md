# MedSIS-App: System Context & Rules for AI Agents

You are assisting with the MedSIS-App (Medical Student Information System) frontend built in React Native (Expo). 

## 1. Architectural Rules
- **No Monolithic Screens**: All screens inside `app/` (Expo Router) must act ONLY as compositional wrappers. All complex UI and state logic must be extracted into the `components/` directory (categorized by feature like `auth/`, `evaluations/`, `folder/`, etc.).
- **State Management**: Do NOT introduce Redux or Zustand. The application relies on React Context (`AuthContext` and `ThemeContext`) for global states, and custom `services/` (e.g., `messageService.ts`) for polling and background tasks.
- **Backend Communication**: We use Axios to communicate with a PHP 8.3 RESTful API. Endpoints are strictly configured via `constants/Config.ts`. Always respect the JWT Bearer authorization strategy.

## 2. Design System (CRITICAL)
- **NativeWind ONLY**: All styling must be executed using NativeWind utility classes. Avoid `StyleSheet.create` unless absolutely necessary for complex React Native animations.
- **Sharp Design Language**: All interactive elements (Cards, Buttons, Inputs, Modals) must have a strict **2px border radius** (using Tailwind's `rounded-sm` class). Do not use pill-shaped (`rounded-full`) or highly rounded designs.
- **Dark Mode**: Always use semantic color tokens from `constants/Colors.ts` via the `useThemeColor` hook or nativewind's `bg-background`, `text-text` to ensure automatic dark mode support.
- **Icons**: Only use `lucide-react-native`.

## 3. Image Uploads & ML Integrations
Whenever interacting with `expo-image-picker` for documents or "Grade Uploads":
- The application evaluates quality via a **Laplacian Variance Check** (Threshold ~100).
- Emulate or respect the existing blur detection UI feedback flows before posting multipart/form-data to the backend APIs.

## 4. Testing Strictness
- Ensure 100% compliance with our custom node analysis (`test-runner.js`).
- Never use explicit `: any` types.
- Always use optional chaining (`?.`) when parsing API responses.
- Always wrap network requests and async storage operations in `try/catch` error boundaries.
