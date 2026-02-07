import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';

import Colors, { BorderRadius } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

// Custom icon component with proper sizing
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  focused?: boolean;
}) {
  return (
    <View style={props.focused ? styles.iconFocused : undefined}>
      <FontAwesome size={22} style={{ marginBottom: -3 }} {...props} />
    </View>
  );
}

// Add button in center
function AddButton({ color, focused }: { color: string; focused: boolean }) {
  return (
    <View style={[styles.addButton, focused && styles.addButtonFocused]}>
      <FontAwesome name="plus" size={24} color="#FFFFFF" />
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.backgroundSecondary,
          borderTopColor: colors.separator,
          borderTopWidth: 0.5,
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
          ...Platform.select({
            web: {
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(28,28,30,0.9)',
            } as any,
          }),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}>

      {/* Dashboard / Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home" color={color} focused={focused} />
          ),
        }}
      />

      {/* Statistics */}
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Statistik',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="bar-chart" color={color} focused={focused} />
          ),
        }}
      />

      {/* Add Transaction (Center Button) */}
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <AddButton color={color} focused={focused} />
          ),
        }}
      />

      {/* Goals */}
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Ziele',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="bullseye" color={color} focused={focused} />
          ),
        }}
      />

      {/* Settings */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Mehr',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="ellipsis-h" color={color} focused={focused} />
          ),
        }}
      />

      {/* Hide the old "two" tab */}
      <Tabs.Screen
        name="two"
        options={{
          href: null, // This hides it from the tab bar
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconFocused: {
    // Subtle scale effect for focused icons
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 20 : 25,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonFocused: {
    backgroundColor: '#0056B3',
    transform: [{ scale: 0.95 }],
  },
});
