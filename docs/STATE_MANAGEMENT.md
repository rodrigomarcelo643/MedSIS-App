# State Management & Services

## Global State Architecture
Because ARDMS is heavily dependent on the current student's status, standard state management is relegated to React Contexts instead of heavy third-parties like Redux.

### 1. AuthContext (`contexts/AuthContext.tsx`)
- **Responsibility**: Manages the authentication lifecycle.
- **Data Held**:
  - `user`: The current authenticated student's data (ID, name, program, avatar metadata, and year level).
  - `token`: The active JWT or session key used for backend API authorization.
  - `isLoading`: Global boot state.
- **Logic**: Automatically handles the app's boot phase logic. If a token resolves successfully, the `app/_layout` navigator pushes the user into `(tabs)`. If it expires or doesn't exist, it routes them to `auth/login.tsx`.

### 2. ThemeContext (`contexts/ThemeContext.tsx`)
- Triggers re-renders on system theme preference changes, seamlessly injecting new tokens into NativeWind's parsing engine.

## Extraction of Complex Services
Instead of putting polling or external logic into the UI components, we utilize single-responsibility `Service` files:

### `services/messageService.ts`
- **Utility**: Abstracts the complexities of chat. It handles fetching conversation lists, individual messages, and implements specific logic for live updates without leaking `setTimeout` or `WebSocket` cleanup logic into the `chat/` screens.

### `services/notificationService.ts`
- **Utility**: Handles checking for device permissions, generating the hardware token for `expo-notifications`, and passing that payload to `api/save_push_token.php`. It also manages the Philippine time formatting logic before pushing notifications to the local device UI.
