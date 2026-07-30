import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { theme } from '../styles/theme';

import { RecruiterDashboardScreen } from '../screens/recruiter/RecruiterDashboardScreen';
import { RecruiterJobsScreen } from '../screens/recruiter/RecruiterJobsScreen';
import { JobApplicantsScreen } from '../screens/recruiter/JobApplicantsScreen';
import { ShortlistedCandidatesScreen } from '../screens/recruiter/ShortlistedCandidatesScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const RecruiterJobsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="RecruiterJobsMain" component={RecruiterJobsScreen} />
    <Stack.Screen name="JobApplicants" component={JobApplicantsScreen} />
  </Stack.Navigator>
);

export const RecruiterNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
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
        name="DashboardTab"
        component={RecruiterDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20 }}>{focused ? '📊' : '📈'}</Text>,
        }}
      />
      <Tab.Screen
        name="RecruiterJobsTab"
        component={RecruiterJobsStack}
        options={{
          tabBarLabel: 'My Jobs',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20 }}>{focused ? '💼' : '📁'}</Text>,
        }}
      />
      <Tab.Screen
        name="ShortlistedTab"
        component={ShortlistedCandidatesScreen}
        options={{
          tabBarLabel: 'Shortlisted',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20 }}>{focused ? '⭐' : '🌟'}</Text>,
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
