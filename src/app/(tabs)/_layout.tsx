import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { colors, fontSize } from '../../lib/theme';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    index: '🎬',
    friends: '👥',
    profile: '👤',
  };
  return <Text style={styles.icon}>{icons[name] || '•'}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.gray[950],
          borderTopColor: colors.gray[800],
          borderTopWidth: 0.5,
          height: 85,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ focused }) => <TabIcon name="friends" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 22,
  },
});
