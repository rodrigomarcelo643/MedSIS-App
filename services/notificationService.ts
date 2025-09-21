import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Check if we're in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Save push token to your Hostinger backend
export const savePushToken = async (
  userId: number,
  token: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      "https://msis.eduisync.io/api/save_push_token.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          push_token: token,
          platform: Platform.OS,
          device_name: Device.modelName || "Unknown Device",
        }),
      }
    );

    const data = await response.json();
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
  if (!Device.isDevice) {
    console.log("Must use physical device for notifications");
    return null;
  }

  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo push token:", token);

    // Send token to your Hostinger backend
    await savePushToken(userId, token);

    // Configure background notification handling
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
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
  handler: (notification: Notifications.Notification) => void
) => {
  const subscription = Notifications.addNotificationReceivedListener(handler);
  return subscription;
};

// Listen for notification responses (user taps on notification)
export const setNotificationResponseHandler = (
  handler: (response: Notifications.NotificationResponse) => void
) => {
  const subscription = Notifications.addNotificationResponseReceivedListener(handler);
  return subscription;
};

// Local notification fallback for Expo Go
export const showLocalNotification = async (
  title: string,
  body: string,
  data: any = {}
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null, // Send immediately
  });
};

// Send notification through your Hostinger backend
export const sendPushNotification = async (
  userId: number,
  title: string,
  message: string,
  data: any = {}
) => {
  try {
    const response = await fetch(
      "https://msis.eduisync.io/api/send_notification.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          title,
          message,
          data,
        }),
      }
    );

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error("Error sending push notification:", error);

    // Fallback to local notification if in Expo Go
    if (isExpoGo) {
      await showLocalNotification(title, message, data);
      return true;
    }

    return false;
  }
};

// Get notification count from your Hostinger backend
export const fetchNotificationCount = async (
  userId: number
): Promise<number> => {
  try {
    const response = await fetch(
      `https://msis.eduisync.io/api/get_notification_count.php?user_id=${userId}`
    );
    const data = await response.json();

    if (data.success) {
      const unreadCount = data.unread_count || 0;
      
      // Set app badge count
      if (Platform.OS !== 'web') {
        Notifications.setBadgeCountAsync(unreadCount);
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
    await Notifications.setBadgeCountAsync(0);
  }
};