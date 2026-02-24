import { View, StyleSheet } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, surface } from '../../lib/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: surface.base,
          borderTopColor: surface.border,
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
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/actor-search');
          },
        }}
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.addButton}>
              <Ionicons name="add" size={32} color={colors.white} />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
