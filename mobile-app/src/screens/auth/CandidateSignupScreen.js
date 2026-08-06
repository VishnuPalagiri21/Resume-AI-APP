import React, { useState } from 'react';
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
import { useAuth } from '../../context/AuthContext';

export const CandidateSignupScreen = ({ navigation }) => {
  const { signup, login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [secureText, setSecureText] = useState(true);

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      setErrorMsg('Please fill in your name, email, and password.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await signup({ fullName, email, password, phone, role: 'user' });
      await login(email, password, 'user');
    } catch (err) {
      setErrorMsg(err.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Top Portal Strip (01 ── CANDIDATE PORTAL) ── */}
      <View style={styles.topHeaderBar}>
        <View style={styles.topHeaderContent}>
          <Text style={styles.portalNumber}>01</Text>
          <View style={styles.topHeaderLine} />
          <Text style={styles.portalLabelText}>CANDIDATE PORTAL</Text>
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
                <Text style={styles.logoSubText}>AI CAREER & ATS SUITE</Text>
              </View>
            </View>

            {/* ── Portal Pill Badge ── */}
            <View style={styles.pillBadgeContainer}>
              <View style={styles.pillBadge}>
                <View style={styles.pillDot} />
                <Text style={styles.pillText}>CANDIDATE SIGN-UP</Text>
              </View>
            </View>

            {/* ── Heading ── */}
            <View style={styles.headingBox}>
              <Text style={styles.welcomeTitle}>
                Create <Text style={styles.welcomeItalic}>account.</Text>
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Join ResumeAI — tailor your resume with AI & land top jobs.
              </Text>
            </View>
          </View>

          {/* ── Alerts ── */}
          {errorMsg ? (
            <View style={styles.errorAlert}>
              <Text style={styles.errorAlertText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* ── FULL NAME Input ── */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>FULL NAME</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Alex Morgan"
                placeholderTextColor="#64748B"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* ── EMAIL ADDRESS Input ── */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#64748B"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* ── PHONE NUMBER Input ── */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>PHONE NUMBER (OPTIONAL)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor="#64748B"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* ── PASSWORD Input ── */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>CREATE PASSWORD</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Minimum 8 characters"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureText}
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

          {/* ── Primary Submit Button ── */}
          <TouchableOpacity
            style={[
              styles.signInButton,
              loading && styles.signInButtonDisabled,
            ]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.signInButtonText}>
              {loading ? 'Creating Account...' : 'Create Free Account  →'}
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
                style={[styles.portalCard, styles.portalCardActive]}
                onPress={() => navigation.navigate('Login', { role: 'user' })}
                activeOpacity={0.8}
              >
                <Text style={styles.portalCardIcon}>👤</Text>
                <Text
                  style={[
                    styles.portalCardTitle,
                    styles.portalCardTitleActive,
                  ]}
                >
                  Candidate
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.portalCard}
                onPress={() => navigation.navigate('RecruiterAuth')}
                activeOpacity={0.8}
              >
                <Text style={styles.portalCardIcon}>🏢</Text>
                <Text style={styles.portalCardTitle}>Recruiter</Text>
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
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}>Sign in →</Text>
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
  inputGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A78BFA',
    letterSpacing: 1.3,
    marginBottom: 6,
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
  signInButton: {
    backgroundColor: '#8B5CF6',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.5)',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
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
