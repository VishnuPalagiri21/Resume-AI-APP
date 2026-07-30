import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';

export const RoleSelectScreen = ({ navigation }) => {
  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.headerBox}>
        <Text style={styles.logoBadge}>✨ RESUME AI MOBILE</Text>
        <Text style={styles.title}>Welcome to Resume AI</Text>
        <Text style={styles.subtitle}>Select your portal to continue</Text>
      </View>

      <View style={styles.cardContainer}>
        {/* Candidate Portal */}
        <TouchableOpacity
          style={[styles.portalCard, { borderColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Login', { role: 'user' })}
          activeOpacity={0.8}
        >
          <Text style={styles.portalIcon}>👤</Text>
          <Text style={styles.portalTitle}>Candidate Portal</Text>
          <Text style={styles.portalDesc}>
            Upload resumes, check ATS score, tailor resumes with AI & apply for jobs.
          </Text>
          <Text style={styles.actionText}>Login / Signup as Candidate →</Text>
        </TouchableOpacity>

        {/* Recruiter Portal */}
        <TouchableOpacity
          style={[styles.portalCard, { borderColor: theme.colors.accent }]}
          onPress={() => navigation.navigate('RecruiterAuth')}
          activeOpacity={0.8}
        >
          <Text style={styles.portalIcon}>💼</Text>
          <Text style={styles.portalTitle}>Recruiter Portal</Text>
          <Text style={styles.portalDesc}>
            Post jobs, inspect ATS match rankings, and shortlist top talent.
          </Text>
          <Text style={[styles.actionText, { color: theme.colors.accent }]}>
            Recruiter Login / Register →
          </Text>
        </TouchableOpacity>

        {/* Admin Portal */}
        <TouchableOpacity
          style={[styles.portalCard, { borderColor: theme.colors.warning }]}
          onPress={() => navigation.navigate('AdminLogin')}
          activeOpacity={0.8}
        >
          <Text style={styles.portalIcon}>🛡️</Text>
          <Text style={styles.portalTitle}>Admin Portal</Text>
          <Text style={styles.portalDesc}>
            Platform stats, recruiter approval workflows & user management.
          </Text>
          <Text style={[styles.actionText, { color: theme.colors.warning }]}>
            Admin Portal Access →
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: theme.spacing.lg,
    justifyContent: 'center',
    minHeight: '100%',
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoBadge: {
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
    color: theme.colors.primaryLight,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.sm,
    letterSpacing: 1,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  cardContainer: {
    gap: theme.spacing.md,
  },
  portalCard: {
    backgroundColor: theme.colors.cardBg,
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  portalIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  portalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  portalDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  actionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.primaryLight,
  },
});
