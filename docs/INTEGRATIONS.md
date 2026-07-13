# Integrations & External Services

## Backend API Communications

### Architecture
The MedSIS-App communicates with the `MedSIS-App-Backend` (a PHP 8.3/MySQL stack) via RESTful API methodology.

### Implementation Details
- **HTTP Client**: Data fetching is handled using `Axios` (`^1.11.0`).
- **Configuration Hub**: The base URL and endpoint configurations are routed through `constants/Config.ts` to easily switch between development and production environments.
- **Authentication Handshake**:
  1. The app POSTs credentials to `api/login.php`.
  2. Receives a JWT or session identifier.
  3. This token is securely stored (via Context/SecureStore) and passed in the `Authorization` headers for all authenticated downstream requests (like `api/evaluations/get_student_learningmaterials.php`).

---

## Specific Feature Integrations

### 1. Document & Grade Image Uploads (Multipart/Form-Data)
When students submit requirements or grade evaluations:
- The app uses `expo-image-picker` to select the file.
- Before transmission, the image undergoes an **ML-Powered Blur Analysis**. (A local Laplacian variance check ensures visual clarity).
- Files are transmitted to endpoints like `api/grade_uploads/upload_grade_image.php` where binary streams are safely checked before server storage.

### 2. Push Notifications
- Integrated using `expo-notifications`.
- **Flow:**
  - Token is generated on the device.
  - Pushed to `api/save_push_token.php`.
  - Background listener captures updates matching the Philippine Timezone specifications.
*(For more specific notification setup sequences, see the `PUSH_NOTIFICATIONS_SETUP.md` in the root).*

### 3. Real-Time Chat Polling / Services
Interfacing with `api/messages/`:
- Uses the `services/messageService.ts` module to handle polling or socket connectivity fetching new message streams without blocking the UI thread.

### 4. Hardware Integrations
- **Camera/Gallery**: Handled directly through Expo standard modules, wrapped inside the `GradeUploadModal` or `FolderModals` components with robust permission boundary fallbacks.
