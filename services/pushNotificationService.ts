import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';
import axios from 'axios';
import { API_BASE_URL } from '@/constants/Config';

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  } as Notifications.NotificationBehavior),
});

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Messages',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
  }

  // Guard for Expo SDK 53+ on Android: Remote notifications are not supported in Expo Go
  if (Platform.OS === 'android' && Constants.appOwnership === 'expo') {
    console.warn(
      'Push notifications (remote) are not supported in Expo Go on Android (SDK 53+). ' +
      'To use this feature, please create a development build.'
    );
    return;
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }
    
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || 
                        Constants.easConfig?.projectId;
      
      if (!projectId) {
        console.warn('No EAS Project ID found in app.json. Fetching token might fail.');
      }

      token = (await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      })).data;
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  } else {
    console.warn('Must use physical device for Push Notifications');
  }

  return token;
}

export async function savePushTokenToServer(userId: string, token: string) {
  try {
    console.log('=== SAVING PUSH TOKEN ===');
    console.log('User ID:', userId);
    console.log('Token:', token);
    console.log('API URL:', `${API_BASE_URL}/api/save_push_token.php`);
    
    const response = await axios.post(`${API_BASE_URL}/api/save_push_token.php`, {
      user_id: userId,
      push_token: token,
      platform: Platform.OS,
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    console.log('=== TOKEN SAVED SUCCESSFULLY ===');
  } catch (error: any) {
    console.error('=== ERROR SAVING PUSH TOKEN ===');
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
  }
}

export function setupNotificationListeners(
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationTapped: (response: Notifications.NotificationResponse) => void
) {
  const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
    onNotificationReceived(notification);
  });
  
  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    onNotificationTapped(response);
  });

  return () => {
    Notifications.removeNotificationSubscription(receivedListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}

export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

export async function clearBadgeCount() {
  await Notifications.setBadgeCountAsync(0);
}
