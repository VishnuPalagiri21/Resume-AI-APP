import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { authApi } from '../../api/authApi';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRequestOtp = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      navigation.navigate('VerifyOtp', { email });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send OTP code');
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
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back to Login</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <View style={styles.iconBox}>
              <Text style={{ fontSize: 28 }}>🔑</Text>
            </View>

            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your registered email address and we'll send you a 6-digit verification code.
            </Text>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <CustomInput
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <CustomButton
              title={loading ? 'Sending Code…' : 'Send Verification Code'}
              onPress={handleRequestOtp}
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
  backBtn: {
    marginBottom: theme.spacing.lg,
  },
  backText: {
    color: theme.colors.primaryLight,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
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
