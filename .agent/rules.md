# MedSIS-App: System Context & Rules for AI Agents

You are assisting with the MedSIS-App (Medical Student Information System) frontend built in React Native (Expo). 

## 1. Architectural Rules
- **No Monolithic Screens**: All screens inside `app/` (Expo Router) must act ONLY as compositional wrappers. All complex UI and state logic must be extracted into the `components/` directory (categorized by feature like `auth/`, `evaluations/`, `folder/`, or shared layouts like `TabsHeader.tsx`).
- **State Management**: The application utilizes a custom Redux-like store architecture built on top of React Context APIs (`createContext`, `useReducer`, `useContext`) located under the `redux/` directory. Use the custom hooks `useSelector` and `useDispatch` from `@/redux/store`. Avoid introducing library packages like raw `redux` or `zustand`.
- **Backend Communication**: We use Axios to communicate with a PHP 8.3 RESTful API. Endpoints are strictly configured via `constants/Config.ts`. Always respect the JWT Bearer authorization strategy.

## 2. Design System (CRITICAL)
- **NativeWind ONLY**: All styling must be executed using NativeWind utility classes. Avoid `StyleSheet.create` unless absolutely necessary for complex React Native animations.
- **Sharp Design Language**: All interactive elements (Cards, Buttons, Inputs, Modals) must have a strict **2px border radius** (using Tailwind's `rounded-sm` class). Do not use pill-shaped (`rounded-full`) or highly rounded designs unless explicitly designed for standard assets (e.g. avatars, specific icons).
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

## 5. Scope & Permissions
- **File Access**: Always strictly follow the exclusions defined in [permissions.json](file:///d:/DevApp/MedSIS-App/.agent/permissions.json).
- **Privacy**: Do not read or leak sensitive `.env` configurations.
- **Efficiency**: Ignore large dependency directories and build artifacts to maintain focus on relevant source code.
