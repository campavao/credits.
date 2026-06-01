import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function ActorIdLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Web slide animations leave a transform that offsets click targets.
        animation: Platform.OS === 'web' ? 'none' : 'default',
      }}
    />
  );
}
