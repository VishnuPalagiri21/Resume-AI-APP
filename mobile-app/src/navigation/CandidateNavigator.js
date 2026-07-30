import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { theme } from '../styles/theme';

import { CandidateDashboardScreen } from '../screens/candidate/CandidateDashboardScreen';
import { JobSearchScreen } from '../screens/candidate/JobSearchScreen';
import { JobDetailScreen } from '../screens/candidate/JobDetailScreen';
import { ApplyJobModalScreen } from '../screens/candidate/ApplyJobModalScreen';
import { ResumeUploadScreen } from '../screens/candidate/ResumeUploadScreen';
import { ResumeAnalysisResultScreen } from '../screens/candidate/ResumeAnalysisResultScreen';
import { ResumeHistoryScreen } from '../screens/candidate/ResumeHistoryScreen';
import { ApplicationsScreen } from '../screens/candidate/ApplicationsScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';

import { DocumentListScreen } from '../screens/editor/DocumentListScreen';
import { TemplateSelectScreen } from '../screens/editor/TemplateSelectScreen';
import { LatexEditorScreen } from '../screens/editor/LatexEditorScreen';
import { PdfPreviewScreen } from '../screens/editor/PdfPreviewScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack for Dashboard & general flow
const CandidateDashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DashboardMain" component={CandidateDashboardScreen} />
    <Stack.Screen name="JobDetail" component={JobDetailScreen} />
    <Stack.Screen name="ApplyJobModal" component={ApplyJobModalScreen} />
    <Stack.Screen name="ResumeUpload" component={ResumeUploadScreen} />
    <Stack.Screen name="ResumeAnalysisResult" component={ResumeAnalysisResultScreen} />
    <Stack.Screen name="ResumeHistory" component={ResumeHistoryScreen} />
  </Stack.Navigator>
);

// Stack for Jobs tab
const CandidateJobsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="JobSearchMain" component={JobSearchScreen} />
    <Stack.Screen name="JobDetail" component={JobDetailScreen} />
    <Stack.Screen name="ApplyJobModal" component={ApplyJobModalScreen} />
  </Stack.Navigator>
);

// Stack for Resume ATS tab
const CandidateResumeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ResumeUploadMain" component={ResumeUploadScreen} />
    <Stack.Screen name="ResumeAnalysisResult" component={ResumeAnalysisResultScreen} />
    <Stack.Screen name="ResumeHistory" component={ResumeHistoryScreen} />
  </Stack.Navigator>
);

// Stack for LaTeX Editor tab
const CandidateEditorStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DocumentListMain" component={DocumentListScreen} />
    <Stack.Screen name="TemplateSelect" component={TemplateSelectScreen} />
    <Stack.Screen name="LatexEditor" component={LatexEditorScreen} />
    <Stack.Screen name="PdfPreview" component={PdfPreviewScreen} />
  </Stack.Navigator>
);

export const CandidateNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primaryLight,
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
        component={CandidateDashboardStack}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20 }}>{focused ? '🏠' : '🛖'}</Text>,
        }}
      />
      <Tab.Screen
        name="JobsTab"
        component={CandidateJobsStack}
        options={{
          tabBarLabel: 'Jobs',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20 }}>{focused ? '💼' : '📁'}</Text>,
        }}
      />
      <Tab.Screen
        name="ResumesTab"
        component={CandidateResumeStack}
        options={{
          tabBarLabel: 'ATS Scan',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20 }}>{focused ? '🤖' : '📄'}</Text>,
        }}
      />
      <Tab.Screen
        name="LatexEditorTab"
        component={CandidateEditorStack}
        options={{
          tabBarLabel: 'LaTeX Editor',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20 }}>{focused ? '📝' : '✏️'}</Text>,
        }}
      />
      <Tab.Screen
        name="ApplicationsTab"
        component={ApplicationsScreen}
        options={{
          tabBarLabel: 'Applications',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20 }}>{focused ? '📩' : '✉️'}</Text>,
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
