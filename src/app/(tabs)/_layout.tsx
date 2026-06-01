import { View, StyleSheet, Platform } from 'react-native';
import { Tabs, router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing } from '../../lib/theme';

// Floating-bar geometry. Screens add `TAB_BAR_CLEARANCE` of bottom padding to
// their scroll content so nothing hides behind the floating glass pill.
const BAR_HEIGHT = 66;
const SIDE_MARGIN = spacing.md;
export const TAB_BAR_CLEARANCE = 112;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottom = (insets.bottom || spacing.md) + 4;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          left: SIDE_MARGIN,
          right: SIDE_MARGIN,
          bottom,
          height: BAR_HEIGHT,
          borderRadius: BAR_HEIGHT / 2,
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          elevation: 0,
          // Floating drop shadow
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.45,
          shadowRadius: 20,
        },
        tabBarItemStyle: {
          paddingTop: 8,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: '500',
          marginTop: 1,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={Platform.OS === 'web' ? 30 : 60}
            tint="dark"
            style={styles.glass}
          />
        ),
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.gray[400],
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={22} color={color} />
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
              <Ionicons name="add" size={30} color={colors.white} />
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
            <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  glass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BAR_HEIGHT / 2,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(18,18,22,0.45)',
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
