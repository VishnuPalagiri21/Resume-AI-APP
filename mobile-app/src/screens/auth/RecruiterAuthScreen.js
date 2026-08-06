import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { SavedAccountsBottomSheet } from '../../components/common/SavedAccountsBottomSheet';
import { useAuth } from '../../context/AuthContext';
import {
  getRoleCredentials,
  saveRoleCredential,
  removeRoleCredential,
} from '../../utils/savedCredentials';

export const RecruiterAuthScreen = ({ navigation }) => {
  const { login, signup } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [secureText, setSecureText] = useState(true);

  const [savedAccounts, setSavedAccounts] = useState([]);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  useEffect(() => {
    const loadSaved = async () => {
      const creds = await getRoleCredentials('recruiter');
      setSavedAccounts(creds);
    };
    loadSaved();
  }, [isRegister]);

  const handleSelectAccount = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setShowBottomSheet(false);
  };

  const handleRemoveAccount = async (accEmail) => {
    await removeRoleCredential('recruiter', accEmail);
    const updated = savedAccounts.filter(
      (a) => a.email.toLowerCase() !== accEmail.toLowerCase()
    );
    setSavedAccounts(updated);
    if (email.toLowerCase() === accEmail.toLowerCase()) {
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    setInfoMsg('');

    if (!email || !password) {
      setErrorMsg('Email and Password are required.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        if (!fullName || !company) {
          setErrorMsg('Full Name and Company Name are required.');
          setLoading(false);
          return;
        }
        await signup(
          email,
          password,
          'recruiter',
          fullName,
          company,
          'approved'
        );
        if (rememberMe) {
          await saveRoleCredential('recruiter', email, password);
        }
      } else {
        await login(email, password, 'recruiter');
        if (rememberMe) {
          await saveRoleCredential('recruiter', email, password);
        }
      }
    } catch (err) {
      setErrorMsg(
        err.message ||
          (isRegister ? 'Registration failed.' : 'Login failed.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Top Portal Strip (02 ── RECRUITER PORTAL) ── */}
      <View style={styles.topHeaderBar}>
        <View style={styles.topHeaderContent}>
          <Text style={styles.portalNumber}>02</Text>
          <View style={styles.topHeaderLine} />
          <Text style={styles.portalLabelText}>RECRUITER PORTAL</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Ambient Brand Glow Orbs */}
          <View style={styles.orbTopLeft} pointerEvents="none" />
          <View style={styles.orbBottomRight} pointerEvents="none" />

          {/* ── Brand Logo ── */}
          <View style={styles.logoSection}>
            <View style={styles.logoRow}>
              <View style={styles.logoIconContainer}>
                <Text style={styles.logoEmoji}>⚡</Text>
              </View>
              <View>
                <Text style={styles.logoText}>ResumeAI</Text>
                <Text style={styles.logoSubText}>AI RECRUITING SUITE</Text>
              </View>
            </View>

            {/* ── Portal Pill Badge ── */}
            <View style={styles.pillBadgeContainer}>
              <View style={styles.pillBadge}>
                <View style={styles.pillDot} />
                <Text style={styles.pillText}>
                  {isRegister ? 'RECRUITER SIGN-UP' : 'RECRUITER SIGN-IN'}
                </Text>
              </View>
            </View>

            {/* ── Heading ── */}
            <View style={styles.headingBox}>
              <Text style={styles.welcomeTitle}>
                {isRegister ? (
                  <>
                    Create <Text style={styles.welcomeItalic}>account.</Text>
                  </>
                ) : (
                  <>
                    Welcome <Text style={styles.welcomeItalic}>back.</Text>
                  </>
                )}
              </Text>
              <Text style={styles.welcomeSubtitle}>
                {isRegister
                  ? 'Register your company to discover & hire top talent.'
                  : 'Sign in to access your recruitment dashboard.'}
              </Text>
            </View>
          </View>

          {/* ── Alerts ── */}
          {errorMsg ? (
            <View style={styles.errorAlert}>
              <Text style={styles.errorAlertText}>{errorMsg}</Text>
            </View>
          ) : null}

          {infoMsg ? (
            <View style={styles.infoAlert}>
              <Text style={styles.infoAlertText}>{infoMsg}</Text>
            </View>
          ) : null}

          {/* ── Registration Fields (if isRegister) ── */}
          {isRegister ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>FULL NAME</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Sarah Jenkins"
                    placeholderTextColor="#64748B"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>COMPANY NAME</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Acme Inc."
                    placeholderTextColor="#64748B"
                    value={company}
                    onChangeText={setCompany}
                  />
                </View>
              </View>
            </>
          ) : null}

          {/* ── EMAIL ADDRESS Input ── */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>
              {isRegister ? 'WORK EMAIL ADDRESS' : 'EMAIL ADDRESS'}
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="recruiter@company.com"
                placeholderTextColor="#64748B"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="username"
                textContentType="username"
                onFocus={async () => {
                  if (!isRegister) {
                    const creds = await getRoleCredentials('recruiter');
                    setSavedAccounts(creds);
                    if (creds.length > 0) setShowBottomSheet(true);
                  }
                }}
              />
            </View>
          </View>

          <SavedAccountsBottomSheet
            visible={showBottomSheet}
            role="recruiter"
            accounts={savedAccounts}
            onSelectAccount={handleSelectAccount}
            onRemoveAccount={handleRemoveAccount}
            onClose={() => setShowBottomSheet(false)}
          />

          {/* ── PASSWORD Input with Forgot password? right-aligned pill ── */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordHeaderRow}>
              <Text style={styles.fieldLabel}>
                {isRegister ? 'CREATE PASSWORD' : 'PASSWORD'}
              </Text>
              {!isRegister ? (
                <TouchableOpacity
                  style={styles.forgotPillBtn}
                  onPress={() => navigation.navigate('ForgotPassword')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPillText}>Forgot password?</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureText}
                autoComplete="current-password"
                textContentType="password"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setSecureText(!secureText)}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeIcon}>{secureText ? '👁️' : '🔒'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Remember me for 30 days ── */}
          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.checkbox,
                rememberMe && styles.checkboxChecked,
              ]}
            >
              {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
            <Text style={styles.rememberLabel}>Remember me for 30 days</Text>
          </TouchableOpacity>

          {/* ── Primary Submit Button ── */}
          <TouchableOpacity
            style={[
              styles.signInButton,
              loading && styles.signInButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.signInButtonText}>
              {loading
                ? isRegister
                  ? 'Creating account...'
                  : 'Signing in...'
                : isRegister
                ? 'Create Account  →'
                : 'Sign in  →'}
            </Text>
          </TouchableOpacity>

          {/* ── OTHER PORTALS Section ── */}
          <View style={styles.otherPortalsSection}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OTHER PORTALS</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.portalCardsRow}>
              <TouchableOpacity
                style={styles.portalCard}
                onPress={() => navigation.navigate('Login', { role: 'user' })}
                activeOpacity={0.8}
              >
                <Text style={styles.portalCardIcon}>👤</Text>
                <Text style={styles.portalCardTitle}>Candidate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.portalCard, styles.portalCardActive]}
                onPress={() => setIsRegister(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.portalCardIcon}>🏢</Text>
                <Text
                  style={[
                    styles.portalCardTitle,
                    styles.portalCardTitleActive,
                  ]}
                >
                  Recruiter
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.portalCard}
                onPress={() => navigation.navigate('AdminLogin')}
                activeOpacity={0.8}
              >
                <Text style={styles.portalCardIcon}>🛡️</Text>
                <Text style={styles.portalCardTitle}>Admin</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Footer Link ── */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              {isRegister
                ? 'Already have a recruiter account? '
                : 'Not registered? '}
            </Text>
            <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
              <Text style={styles.footerLink}>
                {isRegister ? 'Sign in →' : 'Create an account →'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#03060A',
  },
  topHeaderBar: {
    height: 48,
    backgroundColor: '#070C14',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  topHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  portalNumber: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#A78BFA',
    fontWeight: '700',
  },
  topHeaderLine: {
    width: 28,
    height: 1,
    backgroundColor: '#475569',
    marginHorizontal: 12,
  },
  portalLabelText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#06B6D4',
    letterSpacing: 2,
  },
  root: {
    flex: 1,
    backgroundColor: '#03060A',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  orbTopLeft: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'transparent',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 160,
    top: -120,
    left: -120,
  },
  orbBottomRight: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'transparent',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 140,
    bottom: -80,
    right: -80,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  logoIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.45)',
  },
  logoEmoji: {
    fontSize: 22,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  logoSubText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#06B6D4',
    letterSpacing: 2,
  },
  pillBadgeContainer: {
    marginBottom: 22,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.35)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06B6D4',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06B6D4',
    letterSpacing: 1.5,
  },
  headingBox: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#F3F4F6',
    letterSpacing: -0.5,
  },
  welcomeItalic: {
    fontStyle: 'italic',
    color: '#06B6D4',
    fontWeight: '400',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'center',
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorAlertText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoAlert: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  infoAlertText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 18,
  },
  passwordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A78BFA',
    letterSpacing: 1.3,
    marginBottom: 6,
  },
  forgotPillBtn: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  forgotPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06B6D4',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#F3F4F6',
  },
  eyeBtn: {
    padding: 6,
  },
  eyeIcon: {
    fontSize: 16,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#64748B',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberLabel: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: '#8B5CF6',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.5)',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  otherPortalsSection: {
    marginTop: 34,
    marginBottom: 24,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1.5,
    marginHorizontal: 12,
  },
  portalCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  portalCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  portalCardActive: {
    borderColor: '#06B6D4',
    borderWidth: 1.5,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
  },
  portalCardIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  portalCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  portalCardTitleActive: {
    color: '#06B6D4',
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  footerLink: {
    color: '#06B6D4',
    fontSize: 13,
    fontWeight: '700',
  },
});
