import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { useAuth } from '../../context/AuthContext';

export const RecruiterAuthScreen = ({ navigation }) => {
  const { login, signup } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleSubmit = async () => {
    setErrorMsg('');
    setInfoMsg('');

    if (!email || !password) {
      setErrorMsg('Email and Password are required');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        if (!fullName || !company) {
          setErrorMsg('Full Name and Company Name are required');
          setLoading(false);
          return;
        }
        await signup({
          email,
          password,
          fullName,
          company,
          role: 'recruiter',
        });
        setInfoMsg('Recruiter account created! Pending admin approval before posting jobs.');
        setIsRegister(false);
      } else {
        await login(email, password, 'recruiter');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scroll}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back to Roles</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{isRegister ? 'Register Recruiter' : 'Recruiter Sign In'}</Text>
      <Text style={styles.subtitle}>
        {isRegister ? 'Post jobs and match top candidates' : 'Access your recruiter dashboard'}
      </Text>

      {errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {infoMsg ? (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{infoMsg}</Text>
        </View>
      ) : null}

      {isRegister ? (
        <>
          <CustomInput
            label="Full Name"
            placeholder="Jane Smith"
            value={fullName}
            onChangeText={setFullName}
          />
          <CustomInput
            label="Company Name"
            placeholder="Acme Corp"
            value={company}
            onChangeText={setCompany}
          />
        </>
      ) : null}

      <CustomInput
        label="Work Email Address"
        placeholder="recruiter@company.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <CustomInput
        label="Password"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <CustomButton
        title={isRegister ? 'Submit Registration' : 'Sign In as Recruiter'}
        onPress={handleSubmit}
        loading={loading}
        variant="secondary"
        style={{ marginTop: theme.spacing.md }}
      />

      <TouchableOpacity
        style={styles.toggleBtn}
        onPress={() => {
          setIsRegister(!isRegister);
          setErrorMsg('');
          setInfoMsg('');
        }}
      >
        <Text style={styles.toggleText}>
          {isRegister ? 'Already registered? Sign In' : 'New Recruiter? Register Company'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: theme.spacing.lg,
    justifyContent: 'center',
    minHeight: '100%',
  },
  backBtn: {
    marginBottom: theme.spacing.md,
  },
  backText: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
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
  infoBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: theme.colors.success,
    borderWidth: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  infoText: {
    color: theme.colors.success,
    fontSize: theme.fontSize.sm,
  },
  toggleBtn: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  toggleText: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
  },
});
