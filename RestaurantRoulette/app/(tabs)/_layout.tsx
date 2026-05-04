import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FilterProvider } from '@/contexts/filter-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <FilterProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Map',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="mappin.and.ellipse" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Roulette',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="star.circle.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="clock.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </FilterProvider>
  );
}
