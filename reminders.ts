import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Festival } from '../content/catalog';
import { s, fmt } from '../i18n';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export async function ensureNotificationPermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('festival-reminders', {
      name: 'Festival reminders', importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

/** Schedules a reminder at 8:00 AM local time the day before the festival. Returns notification id or null. */
export async function scheduleFestivalReminder(f: Festival): Promise<string | null> {
  if (!(await ensureNotificationPermission())) return null;
  const [y, m, d] = f.date.split('-').map(Number);
  const when = new Date(y, m - 1, d - 1, 8, 0, 0);
  if (when.getTime() < Date.now()) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: fmt(s().calendar.reminderTitle, { f: f.name }),
      body: s().calendar.reminderBody,
      data: { festivalId: f.id, greetingCategory: f.greetingCategory, name: f.name },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: 'festival-reminders' },
  });
}
export async function cancelReminder(id?: string) { if (id) await Notifications.cancelScheduledNotificationAsync(id); }
