import Constants from "expo-constants";
import { isDevice, modelName } from "expo-device";
import { 
  setNotificationHandler, 
  getPermissionsAsync, 
  requestPermissionsAsync, 
  getExpoPushTokenAsync, 
  setNotificationChannelAsync, 
  AndroidImportance, 
  addNotificationReceivedListener, 
  addNotificationResponseReceivedListener, 
  scheduleNotificationAsync, 
  AndroidNotificationPriority, 
  setBadgeCountAsync, 
  NotificationBehavior, 
  Notification, 
  NotificationResponse 
} from "expo-notifications";
import { Platform } from "react-native";
import { API_BASE_URL } from '@/constants/Config';
import axios from 'axios';

// Configure notification handling
setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  } as NotificationBehavior),
});

// Save push token to your Hostinger backend
export const savePushToken = async (
  userId: number,
  token: string
): Promise<boolean> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/save_push_token.php`,
      {
        user_id: userId,
        push_token: token,
        platform: Platform.OS,
        device_name: modelName || "Unknown Device",
      }
    );

    const data = response.data;
    return data.success === true;
  } catch (error) {
    console.error("Error saving push token:", error);
    return false;
  }
};

// Register for push notifications
export const registerForPushNotifications = async (
  userId: number
): Promise<string | null> => {
  if (!isDevice) {
    console.log("Must use physical device for notifications");
    return null;
  }

  try {
    const { status: existingStatus } =
      await getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return null;
    }

    const token = (await getExpoPushTokenAsync()).data;
    console.log("Expo push token:", token);

    // Send token to your Hostinger backend
    await savePushToken(userId, token);

    // Configure background notification handling
    if (Platform.OS === 'android') {
      await setNotificationChannelAsync('default', {
        name: 'default',
        importance: AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  } catch (error) {
    console.log("Error getting push token:", error);
    return null;
  }
};

// Listen for notifications received while the app is in the foreground
export const setNotificationForegroundHandler = (
  handler: (notification: Notification) => void
) => {
  const subscription = addNotificationReceivedListener(handler);
  return subscription;
};

// Listen for notification responses (user taps on notification)
export const setNotificationResponseHandler = (
  handler: (response: NotificationResponse) => void
) => {
  const subscription = addNotificationResponseReceivedListener(handler);
  return subscription;
};

// Local notification fallback for Expo Go
export const showLocalNotification = async (
  title: string,
  body: string,
  data: Record<string, unknown> = {}
) => {
  await scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
      priority: AndroidNotificationPriority.HIGH,
    },
    trigger: null, // Send immediately
  });
};

// Send notification through your Hostinger backend
export const sendPushNotification = async (
  userId: number,
  title: string,
  message: string,
  data: Record<string, unknown> = {}
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/send_notification.php`,
      {
        user_id: userId,
        title,
        message,
        data,
      }
    );

    const result = response.data;
    return result.success === true;
  } catch (error) {
    console.error("Error sending push notification:", error);

    return false;
  }
};

// Get notification count from your Hostinger backend
export const fetchNotificationCount = async (
  userId: number
): Promise<number> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/get_notification_count.php?user_id=${userId}`
    );
    const data = response.data;

    if (data.success) {
      const unreadCount = data.unread_count || 0;
      
      // Set app badge count
      if (Platform.OS !== 'web') {
        setBadgeCountAsync(unreadCount);
      }
      
      return unreadCount;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching notification count:", error);
    return 0;
  }
};

// Clear all notifications badge count
export const clearBadgeCount = async (): Promise<void> => {
  if (Platform.OS !== 'web') {
    await setBadgeCountAsync(0);
  }
};