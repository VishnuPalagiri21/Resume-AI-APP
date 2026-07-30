import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export const JobCard = ({ job, onPress, onApply }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>
            🏢 {job.company || job.recruiterId?.company || 'Company'}
          </Text>
        </View>
        <Text style={styles.salary}>{job.salaryRange || 'Competitive'}</Text>
      </View>

      <Text style={styles.location}>📍 {job.location || 'Remote'}</Text>

      <Text style={styles.description} numberOfLines={2}>
        {job.description}
      </Text>

      {job.skillsRequired && job.skillsRequired.length > 0 ? (
        <View style={styles.skillsRow}>
          {job.skillsRequired.slice(0, 4).map((skill, idx) => (
            <View key={idx} style={styles.skillPill}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {job.skillsRequired.length > 4 ? (
            <Text style={styles.moreSkills}>+{job.skillsRequired.length - 4} more</Text>
          ) : null}
        </View>
      ) : null}

      {onApply ? (
        <TouchableOpacity style={styles.applyBtn} onPress={onApply}>
          <Text style={styles.applyBtnText}>Apply Now</Text>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBg,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  company: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryLight,
    fontWeight: '500',
    marginTop: 2,
  },
  salary: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.success,
    fontWeight: 'bold',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  location: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
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
  skillPill: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
    marginRight: 6,
    marginBottom: 4,
  },
  skillText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.accent,
    fontWeight: '500',
  },
  moreSkills: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginLeft: 4,
  },
  applyBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  applyBtnText: {
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: theme.fontSize.sm,
  },
});
