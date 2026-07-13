# System Architecture

## Overview
The MedSIS-App is built on a modern, React Native foundation powered by Expo. It leverages a highly modular component architecture designed for maintainability, reuse, and strict separation of concerns between business logic, navigational layouts, and presentation.

### High-Level Tech Stack
- **Framework:** React Native via Expo (~53.0.23)
- **Language:** TypeScript (~5.8.3)
- **Styling:** NativeWind (Tailwind CSS bridging for React Native)
- **Routing:** Expo Router (File-based routing)
- **State Management:** React Context API

---

## Directory & Module Structure

Our source is structured to cleanly separate "Screens" from "Blocks" (Components).

### 1. File-Based Routing (`/app`)
The `app/` directory uses Expo Router to handle navigation.
- **`app/(tabs)/`**: Contains the bottom tab screens (`home`, `folder`, `evaluations`, `profile`, `ai-assistant`). These files act strictly as "Containers". They manage page-level state and orchestrate their sub-components.
- **`app/auth/`**: Wraps the authentication pathways (Login, OTP, Policy, Forgot Password) mapping isolated URIs to the user flow.
- **`app/chat/` & `app/chat-info/`**: Dynamic routes (like `[id].tsx`) that handle mapping parameters to specific data queries.

### 2. Component Ecosystem (`/components`)
Components are divided strictly by functional domains. *We do not use monolithic screens.*
- **`components/ui/`**: Base level primitives (Inputs, Avatars, Spinners, Icons). These are "dumb" components with no business logic.
- **Feature Modules**:
  - `components/auth/`: Modals, headers, form grids handling authentication state.
  - `components/evaluations/`: Grade upload modals, permission banners, eval summaries.
  - `components/folder/`: Requirement items and folder modals.
  - `components/profile/`: Profile forms, editable fields, settings actions.

### 3. State & Context (`/contexts`)
For globally required data:
- **`AuthContext.tsx`**: Holds the JSON Web Token, session details, and user permissions across the app. Automatically redirects from `app/(tabs)` if session expires.
- **`ThemeContext.tsx`**: Manages Light/Dark mode toggling globally with NativeWind integrations.

### 4. Utilities & Services (`/lib` & `/services`)
- **`constants/Config.ts`**: The central source of truth for API URLs and global app behavior. 
- **`services/`**: Holds modular extraction of heavy third-party logic (e.g. `notificationService.ts`).

---

## Design Philosophy

**Component-Driven Development:** 
Every complex screen must be composed of specialized sub-components. If a piece of UI requires its own extensive state (like an Image Uploader), it belongs in a dedicated component file, NOT directly in the `/app` router files.
