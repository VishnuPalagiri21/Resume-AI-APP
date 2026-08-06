import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { authApi } from '../../api/authApi';

export const ResetPasswordScreen = ({ route, navigation }) => {
  const email = route.params?.email || '';
  const resetToken = route.params?.resetToken || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await authApi.resetPassword(email, resetToken, newPassword);
      Alert.alert('Success', 'Password updated successfully. Please login with your new password.', [
        { text: 'OK', onPress: () => navigation.navigate('Login', { role: 'user' }) },
      ]);
    } catch (err) {
      setErrorMsg(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.iconBox}>
              <Text style={{ fontSize: 28 }}>🔒</Text>
            </View>

            <Text style={styles.title}>Set New Password</Text>
            <Text style={styles.subtitle}>Enter a strong new password for your account</Text>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <CustomInput
              label="New Password"
              placeholder="••••••••"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              icon="🔒"
            />

            <CustomInput
              label="Confirm New Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              icon="🔒"
            />

            <CustomButton
              title={loading ? 'Updating Password…' : 'Reset Password'}
              onPress={handleResetPassword}
              loading={loading}
              style={{ marginTop: theme.spacing.md }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bgDark,
  },
  scroll: {
    padding: theme.spacing.lg,
    justifyContent: 'center',
    flexGrow: 1,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    borderRadius: theme.borderRadius.xxl,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    padding: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: theme.colors.dangerBg,
    borderColor: theme.colors.dangerBorder,
    borderWidth: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.dangerText,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
});
