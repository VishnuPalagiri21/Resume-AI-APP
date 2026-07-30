import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
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
        { text: 'OK', onPress: () => navigation.navigate('RoleSelect') },
      ]);
    } catch (err) {
      setErrorMsg(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scroll}>
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
      />

      <CustomInput
        label="Confirm New Password"
        placeholder="••••••••"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <CustomButton
        title="Reset Password"
        onPress={handleResetPassword}
        loading={loading}
        style={{ marginTop: theme.spacing.md }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: theme.spacing.lg,
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: theme.colors.danger,
    borderWidth: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
  },
});
