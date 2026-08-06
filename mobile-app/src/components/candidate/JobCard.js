import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export const JobCard = ({ job, onPress, onApply }) => {
  return (
    // Matches web editor-doc-card / stellar-card hover style
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
          <Text style={styles.company} numberOfLines={1}>
            🏢 {job.company || job.recruiterId?.company || 'Company'}
          </Text>
        </View>
        {/* Salary badge — matches web badge-shortlisted style */}
        <View style={styles.salaryBadge}>
          <Text style={styles.salaryText}>{job.salaryRange || 'Competitive'}</Text>
        </View>
      </View>

      <Text style={styles.location}>📍 {job.location || 'Remote'}</Text>
      <Text style={styles.description} numberOfLines={2}>{job.description}</Text>

      {/* Skill chips — matches web badge tags */}
      {job.skillsRequired && job.skillsRequired.length > 0 ? (
        <View style={styles.skillsRow}>
          {job.skillsRequired.slice(0, 4).map((skill, idx) => (
            <View key={idx} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {job.skillsRequired.length > 4 ? (
            <Text style={styles.moreSkills}>+{job.skillsRequired.length - 4}</Text>
          ) : null}
        </View>
      ) : null}

      {/* Apply button — matches web .btn-primary gradient */}
      {onApply ? (
        <TouchableOpacity style={styles.applyBtn} onPress={onApply} activeOpacity={0.8}>
          <Text style={styles.applyBtnText}>Apply Now</Text>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Matches web stellar-card / editor-doc-card hover
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  company: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primaryLight,
    fontWeight: '700',
    marginTop: 2,
  },
  // Salary — matches web badge-shortlisted (green pill)
  salaryBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  salaryText: {
    fontSize: 10,
    color: theme.colors.successText,
    fontWeight: '800',
  },
  location: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 4,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  // Skill chips — matches web badge-applied (blue pill)
  skillChip: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
    marginRight: 6,
    marginBottom: 6,
  },
  skillText: {
    fontSize: 10,
    color: theme.colors.primaryLight,
    fontWeight: '700',
  },
  moreSkills: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontWeight: '600',
    marginLeft: 4,
    marginBottom: 6,
  },
  // Apply button — matches web .btn-user gradient
  applyBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: theme.fontSize.sm,
    letterSpacing: -0.2,
  },
});
