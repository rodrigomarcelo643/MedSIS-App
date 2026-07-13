# Component Styling & UX Guidelines

## Global Aesthetics & NativeWind
The MedSIS-App strictly utilizes **NativeWind** (TailwindCSS interoperability for React Native) for all component styling. We do not use `StyleSheet.create` unless absolutely necessary for complex animations or native shadow bindings.

### Core Design Rules
1. **The "Sharp" Design Language**: 
   - All interactive elements (buttons, cards, inputs) must adhere to our standardized **2px border radius** (`rounded-sm`). This provides a professional, sharp, and modern organizational feel compared to overly pill-shaped defaults.
2. **Color Tokens Context**: 
   - Colors are defined in `constants/Colors.ts` and managed contextually to automatically adapt between light and dark themes. Use semantic class names like `bg-background`, `text-text`, and `border-border` from the tailwind config instead of hardcoded hex values.

## UX & Micro-Interactions
- **Loading Skeletons**: Rather than simple spinning dots, complex screens (like Evaluation Logs or Folders) use localized Skeleton components (e.g., `EvaluationSkeleton`). This creates smooth UI transitions during API calls.
- **Scroll Behavior**: Lists such as Announcements use lazy-loading (10 items per batch) and include back-to-top navigational aides.

## AI Form-Factor Enhancements
- **ML Blur Detection**: When a user selects a document or evaluate image via `expo-image-picker`, we perform a local `Laplacian variance check` (Threshold roughly ~100). If the UI determines the document is blurry, a quality score warning is triggered, preventing the upload of illegible documents and improving UX before the backend is even reached.

## Icons
Use **Lucide-React-Native** for all SVG icon needs. Ensure that their color props are tied directly to the `useThemeColor()` hook so they invert gracefully in dark mode.
