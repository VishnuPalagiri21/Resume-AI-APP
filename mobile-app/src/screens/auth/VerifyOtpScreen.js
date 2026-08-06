import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { authApi } from '../../api/authApi';

export const VerifyOtpScreen = ({ route, navigation }) => {
  const email = route.params?.email || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      setErrorMsg('Please enter the 6-digit OTP code');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const data = await authApi.verifyResetOtp(email, otp);
      navigation.navigate('ResetPassword', { email, resetToken: data.resetToken || otp });
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired OTP code');
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
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <View style={styles.iconBox}>
              <Text style={{ fontSize: 28 }}>🛡️</Text>
            </View>

            <Text style={styles.title}>Verify OTP Code</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit verification code sent to <Text style={{ color: theme.colors.primaryLight, fontWeight: '700' }}>{email}</Text>
            </Text>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <CustomInput
              label="6-Digit Verification Code"
              placeholder="123456"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              inputStyle={{ letterSpacing: 8, fontSize: 20, textAlign: 'center', fontWeight: '800' }}
            />

            <CustomButton
              title={loading ? 'Verifying Code…' : 'Verify Code'}
              onPress={handleVerify}
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
