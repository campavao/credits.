import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirmation dialog.
 *
 * react-native-web's `Alert.alert` is a no-op for multi-button dialogs, so
 * destructive confirmations (Sign Out, Remove Friend) silently did nothing on
 * web. Use the browser's `confirm()` there and `Alert.alert` on native.
 */
export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = 'OK',
  destructive = false,
) {
  if (Platform.OS === 'web') {
    if (window.confirm(message ? `${title}\n\n${message}` : title)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: confirmLabel,
      style: destructive ? 'destructive' : 'default',
      onPress: onConfirm,
    },
  ]);
}
