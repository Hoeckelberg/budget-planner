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
        tabBarActiveTintColor: '#7B61FF',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 0.5,
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 26 : 8,
          paddingTop: 8,
          ...Platform.select({
            web: {
              boxShadow: '0 -4px 20px rgba(0,0,0,0.04)',
              position: 'sticky',
              bottom: 0,
              height: 62,
              paddingBottom: 10,
              paddingTop: 8,
            } as any,
          }),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
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

      {/* Budgets — hidden from tab bar, accessible via Settings */}
      <Tabs.Screen
        name="budgets"
        options={{
          href: null,
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
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#7B61FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 22 : 22,
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  addButtonFocused: {
    backgroundColor: '#6046FF',
    transform: [{ scale: 0.95 }],
  },
});
