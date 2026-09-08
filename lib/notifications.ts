import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const REMINDERS_CHANNEL_ID = 'ritual-reminders';

export async function setupNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(REMINDERS_CHANNEL_ID, {
    name: 'Ritual reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 150, 150, 150],
    lightColor: '#D97748',
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;

  const result = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return result.granted;
}
