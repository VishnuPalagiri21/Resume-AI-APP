import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RecruiterDashboardScreen } from '../screens/recruiter/RecruiterDashboardScreen';
import { RecruiterJobsScreen } from '../screens/recruiter/RecruiterJobsScreen';
import { JobApplicantsScreen } from '../screens/recruiter/JobApplicantsScreen';
import { ShortlistedCandidatesScreen } from '../screens/recruiter/ShortlistedCandidatesScreen';
import { AllApplicationsScreen } from '../screens/recruiter/AllApplicationsScreen';
import { SelectedCandidatesScreen } from '../screens/recruiter/SelectedCandidatesScreen';
import { RejectedCandidatesScreen } from '../screens/recruiter/RejectedCandidatesScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';

const Stack = createNativeStackNavigator();

export const RecruiterNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="RecruiterDashboard"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {/* ── Primary Sidebar Routes ── */}
      <Stack.Screen name="RecruiterDashboard" component={RecruiterDashboardScreen} />
      <Stack.Screen name="RecruiterJobs" component={RecruiterJobsScreen} />
      <Stack.Screen name="AllApplications" component={AllApplicationsScreen} />
      <Stack.Screen name="JobApplicants" component={JobApplicantsScreen} />
      <Stack.Screen name="ShortlistedCandidates" component={ShortlistedCandidatesScreen} />
      <Stack.Screen name="SelectedCandidates" component={SelectedCandidatesScreen} />
      <Stack.Screen name="RejectedCandidates" component={RejectedCandidatesScreen} />
      <Stack.Screen name="RecruiterProfile" component={ProfileScreen} />

      {/* ── Backward Compatibility Aliases ── */}
      <Stack.Screen name="RecruiterJobsMain" component={RecruiterJobsScreen} />
      <Stack.Screen name="DashboardTab" component={RecruiterDashboardScreen} />
      <Stack.Screen name="RecruiterJobsTab" component={RecruiterJobsScreen} />
      <Stack.Screen name="ApplicantsTab" component={AllApplicationsScreen} />
      <Stack.Screen name="ShortlistedTab" component={ShortlistedCandidatesScreen} />
      <Stack.Screen name="SelectedTab" component={SelectedCandidatesScreen} />
      <Stack.Screen name="RejectedTab" component={RejectedCandidatesScreen} />
      <Stack.Screen name="ProfileTab" component={ProfileScreen} />
    </Stack.Navigator>
  );
};
