import { Stack } from 'expo-router';
import { surface } from '../../lib/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: surface.base },
      }}
    />
  );
}
