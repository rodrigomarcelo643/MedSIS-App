# AI Assistant Context: ML & Edge Services

When modifying complex file uploads or push notification functionality:

## Push Notifications
1. Tokens are captured using `expo-notifications`. 
2. Upon retrieval, they are POSTed to `/api/save_push_token.php`.
3. Notification payloads generated on the backend are standardized to **Philippine Time (PHT)**. If editing date UI logic on the frontend, respect this conversion.

## Machine Learning Laplacian Checks
1. Both Standard Document Uploads and Grade Uploads execute locally before interacting with the network.
2. We utilize Laplacian variance calculations on the resulting image buffers to check for blurriness. 
3. The AI agent must never remove this logic from any file picker flows. It acts as an edge-guard, preventing unreadable data from hitting the API endpoints and consuming storage.
