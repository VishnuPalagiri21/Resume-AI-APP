import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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

const Stack = createNativeStackNavigator();

export const CandidateNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="CandidateDashboard"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {/* ── Primary Sidebar Routes ── */}
      <Stack.Screen name="CandidateDashboard" component={CandidateDashboardScreen} />
      <Stack.Screen name="ResumeATSAnalyzer" component={ResumeUploadScreen} />
      <Stack.Screen name="ResumeAnalysisResult" component={ResumeAnalysisResultScreen} />
      <Stack.Screen name="ResumeHistory" component={ResumeHistoryScreen} />
      <Stack.Screen name="AISuggestions" component={ResumeUploadScreen} />
      <Stack.Screen name="LatexResumeBuilder" component={DocumentListScreen} />
      <Stack.Screen name="TemplateSelect" component={TemplateSelectScreen} />
      <Stack.Screen name="LatexEditor" component={LatexEditorScreen} />
      <Stack.Screen name="PdfPreview" component={PdfPreviewScreen} />
      <Stack.Screen name="SearchJobs" component={JobSearchScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="ApplyJobModal" component={ApplyJobModalScreen} />
      <Stack.Screen name="Applications" component={ApplicationsScreen} />
      <Stack.Screen name="CandidateProfile" component={ProfileScreen} />

      {/* ── Backward Compatibility Aliases for internal screen navigate calls ── */}
      <Stack.Screen name="ResumeUpload" component={ResumeUploadScreen} />
      <Stack.Screen name="DashboardMain" component={CandidateDashboardScreen} />
      <Stack.Screen name="JobSearchMain" component={JobSearchScreen} />
      <Stack.Screen name="ResumeUploadMain" component={ResumeUploadScreen} />
      <Stack.Screen name="DocumentListMain" component={DocumentListScreen} />
      <Stack.Screen name="DashboardTab" component={CandidateDashboardScreen} />
      <Stack.Screen name="JobsTab" component={JobSearchScreen} />
      <Stack.Screen name="ResumesTab" component={ResumeUploadScreen} />
      <Stack.Screen name="LatexEditorTab" component={DocumentListScreen} />
      <Stack.Screen name="ApplicationsTab" component={ApplicationsScreen} />
      <Stack.Screen name="ProfileTab" component={ProfileScreen} />
    </Stack.Navigator>
  );
};
