import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      if (token) setExpoPushToken(token);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (_notification) => {
        // Handle notification received while app is open
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (_response) => {
        // Handle notification tap
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Save token to DB when user and token are available
  useEffect(() => {
    if (user && expoPushToken) {
      supabase.from('push_tokens').upsert({
        user_id: user.id,
        token: expoPushToken,
      });
    }
  }, [user, expoPushToken]);

  return { expoPushToken };
}

async function registerForPushNotifications() {
  if (!Device.isDevice) {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return token.data;
}
