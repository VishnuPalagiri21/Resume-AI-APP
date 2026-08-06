import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { ManageUsersScreen } from '../screens/admin/ManageUsersScreen';
import { ManageRecruitersScreen } from '../screens/admin/ManageRecruitersScreen';
import { ManageJobsScreen } from '../screens/admin/ManageJobsScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';

const Stack = createNativeStackNavigator();

export const AdminNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {/* ── Primary Sidebar Routes ── */}
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminRecruiters" component={ManageRecruitersScreen} />
      <Stack.Screen name="AdminUsers" component={ManageUsersScreen} />
      <Stack.Screen name="AdminJobs" component={ManageJobsScreen} />
      <Stack.Screen name="AdminProfile" component={ProfileScreen} />

      {/* ── Backward Compatibility Aliases ── */}
      <Stack.Screen name="AdminDashboardTab" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminRecruitersTab" component={ManageRecruitersScreen} />
      <Stack.Screen name="AdminUsersTab" component={ManageUsersScreen} />
      <Stack.Screen name="AdminJobsTab" component={ManageJobsScreen} />
      <Stack.Screen name="ProfileTab" component={ProfileScreen} />
    </Stack.Navigator>
  );
};
