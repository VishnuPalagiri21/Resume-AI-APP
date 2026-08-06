import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { DrawerProvider } from '../context/DrawerContext';
import { CustomNavigationDrawer } from '../components/common/CustomNavigationDrawer';

import { AuthNavigator } from './AuthNavigator';
import { CandidateNavigator } from './CandidateNavigator';
import { RecruiterNavigator } from './RecruiterNavigator';
import { AdminNavigator } from './AdminNavigator';

export const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingOverlay message="Initializing Resume AI Mobile..." />;
  }

  return (
    <DrawerProvider>
      <NavigationContainer>
        {!user ? (
          <AuthNavigator />
        ) : user.role === 'recruiter' ? (
          <RecruiterNavigator />
        ) : user.role === 'admin' ? (
          <AdminNavigator />
        ) : (
          <CandidateNavigator />
        )}
        {user ? <CustomNavigationDrawer /> : null}
      </NavigationContainer>
    </DrawerProvider>
  );
};
