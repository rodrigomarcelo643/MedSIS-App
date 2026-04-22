# Agent Instructions: ARDMS Architecture & Routing

## Core Directives for Expo Router
1. **Never build monolithic screens.** The files located in `app/(tabs)/` or `app/auth/` must remain under 150 lines of code. They are strict compositional wrappers.
2. **Feature-based separation.** When asked to build a new feature, automatically create a new subdirectory in `components/` (e.g., `components/enrollment/`) and assemble your UI blocks there. Include those blocks in the `app/` router.
3. **No Redux / Zustand.** All state synchronization relies on Context APIs. Only edit `contexts/AuthContext.tsx` if there is a fundamental change to the backend authentication workflow.

## Component File Structure
Every component generated must:
- Use Named Exports (e.g., `export const Header = () => {}`) 
- Avoid default exports unless it is necessary for Expo Router pages.
- Group sub-components together logically.
