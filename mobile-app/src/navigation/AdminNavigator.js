import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { theme } from '../styles/theme';

import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { ManageUsersScreen } from '../screens/admin/ManageUsersScreen';
import { ManageRecruitersScreen } from '../screens/admin/ManageRecruitersScreen';
import { ManageJobsScreen } from '../screens/admin/ManageJobsScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';

const Tab = createBottomTabNavigator();

export const AdminNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.danger,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.cardBg,
          borderTopColor: theme.colors.cardBorder,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="AdminDashboardTab"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Overview',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20 }}>{focused ? '🛡️' : '📈'}</Text>,
        }}
      />
      <Tab.Screen
        name="AdminRecruitersTab"
        component={ManageRecruitersScreen}
        options={{
          tabBarLabel: 'Recruiters',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20 }}>{focused ? '🏢' : '🏬'}</Text>,
        }}
      />
      <Tab.Screen
        name="AdminUsersTab"
        component={ManageUsersScreen}
        options={{
          tabBarLabel: 'Candidates',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20 }}>{focused ? '👥' : '👤'}</Text>,
        }}
      />
      <Tab.Screen
        name="AdminJobsTab"
        component={ManageJobsScreen}
        options={{
          tabBarLabel: 'Jobs',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20 }}>{focused ? '📋' : '📁'}</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20 }}>{focused ? '👤' : '👤'}</Text>,
        }}
      />
    </Tab.Navigator>
  );
};
