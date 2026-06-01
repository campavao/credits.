import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { surface } from '../../lib/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: surface.base },
        // Avoid the web slide-animation transform that offsets click targets.
        animation: Platform.OS === 'web' ? 'none' : 'default',
      }}
    />
  );
}
