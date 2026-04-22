# Agent Instructions: UI, UX, and NativeWind

## The "Sharp Design" Philosophy
- **Constraint**: Round shapes should be minimized. Use `rounded-sm` (translating to a 2px border radius) for input fields, buttons, interactive cards, and modal borders.
- **Why?**: The application targets a professional, medical-student demographic, so aesthetics prioritize structural sharpness over default mobile bubble-UIs.

## NativeWind Standards
- Never use `StyleSheet.create` unless you need native gesture-handler logic or complex box-shadow bindings that Tailwind struggles with.
- **Theming**: ARDMS features dark/light mode integration. You must configure color assignments contextually using `constants/Colors.ts`.
- **Icons**: When inserting an icon, import it from `lucide-react-native` and apply the stroke color via the dynamic `useThemeColor({}, 'tint')` hook.
