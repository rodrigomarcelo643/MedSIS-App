# Push Notifications Setup Guide

## 📱 How to Enable Push Notifications (Like Messenger)

## ⚠️ IMPORTANT: Push Notifications DON'T Work in Expo Go!
You MUST build an APK or development build. Expo Go doesn't support remote push notifications.

### 1. Install Dependencies
```bash
npx expo install expo-notifications expo-device expo-constants
```

### 2. Database Setup
Run the SQL schema in your database:
```sql
-- See push_tokens_schema.sql
```

### 3. Backend Files (Upload to your server)
- `save-push-token.php` → Upload to `/api/save-push-token.php`
- `send-push-notification.php` → Upload to `/api/send-push-notification.php`

### 4. Update app.json
Add this configuration to your `app.json`:
```json
{
  "expo": {
    "notification": {
      "icon": "./assets/images/notification-icon.png",
      "color": "#ffffff"
    },
    "android": {
      "useNextNotificationsApi": true
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ]
  }
}
```

### 5. Modify Your Message Sending Code
When sending a message, also trigger push notification:

```typescript
// In your messageService.ts or wherever you send messages
import axios from 'axios';
import { API_BASE_URL } from '@/constants/Config';

async function sendMessage(senderId: string, receiverId: string, message: string, senderName: string) {
  // Your existing message sending code...
  
  // Send push notification
  try {
    await axios.post(`${API_BASE_URL}/api/send-push-notification.php`, {
      sender_id: senderId,
      receiver_id: receiverId,
      message: message,
      sender_name: senderName,
    });
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
}
```

### 6. Handle Notifications in App
The `pushNotificationService.ts` is already created and integrated with AuthContext.

### 7. Build APK (REQUIRED - Won't work in Expo Go!)
```bash
# Option 1: Production APK
eas build --platform android --profile production

# Option 2: Development Build
eas build --platform android --profile development
```

### 8. Install APK on Physical Device
- Download the APK from EAS build
- Install on your Android device
- Push notifications will now work!

## 🔔 How It Works

1. **User logs in** → App registers push token with server
2. **Someone sends message** → Server sends push notification to recipient's device
3. **User receives notification** → Even when app is closed
4. **User taps notification** → Opens app to that chat

## ✅ Features
- ✅ Works when app is closed
- ✅ Works when app is in background
- ✅ Shows sender name and message preview
- ✅ Tapping notification opens the chat
- ✅ Sound and vibration
- ✅ Badge count on app icon

## 📝 Notes
- Requires physical device (won't work on emulator)
- User must grant notification permissions
- Push tokens are automatically refreshed
- Multiple devices per user supported
