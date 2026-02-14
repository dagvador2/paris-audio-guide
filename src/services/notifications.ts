/**
 * Service de notifications locales.
 * Gère les alertes quand un checkpoint est atteint et les rappels de visite.
 */

import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function sendCheckpointNotification(checkpointName: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Point d\u2019int\u00e9r\u00eat atteint\u00a0!',
      body: `Vous \u00eates arriv\u00e9(e) \u00e0\u00a0: ${checkpointName}`,
      sound: true,
    },
    trigger: null,
  });
}

export async function scheduleReminderNotification(tourName: string): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Reprendre votre visite\u00a0?',
      body: `Votre visite \u00ab\u00a0${tourName}\u00a0\u00bb n\u2019est pas termin\u00e9e.`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 7200,
    },
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.dismissAllNotificationsAsync();
}
