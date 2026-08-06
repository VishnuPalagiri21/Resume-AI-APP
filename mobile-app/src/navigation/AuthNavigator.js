import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { CandidateSignupScreen } from '../screens/auth/CandidateSignupScreen';
import { RecruiterAuthScreen } from '../screens/auth/RecruiterAuthScreen';
import { AdminLoginScreen } from '../screens/auth/AdminLoginScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { VerifyOtpScreen } from '../screens/auth/VerifyOtpScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        initialParams={{ role: 'user' }}
      />
      <Stack.Screen name="CandidateSignup" component={CandidateSignupScreen} />
      <Stack.Screen name="RecruiterAuth" component={RecruiterAuthScreen} />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};
