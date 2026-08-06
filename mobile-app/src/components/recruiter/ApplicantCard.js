import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';
import { StatusBadge } from '../common/StatusBadge';

export const ApplicantCard = ({ applicant, onUpdateStatus }) => {
  const user = applicant.userId || {};
  const resume = applicant.resumeId || {};

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user.fullName || 'Anonymous Applicant'}</Text>
          <Text style={styles.email}>📧 {user.email || 'No email'}</Text>
          {user.phone ? <Text style={styles.phone}>📞 {user.phone}</Text> : null}
        </View>
        <View style={styles.atsContainer}>
          <Text style={styles.atsScore}>{applicant.atsScore ?? 0}%</Text>
          <Text style={styles.atsLabel}>Match</Text>
        </View>
      </View>

      <View style={{ marginVertical: theme.spacing.xs }}>
        <StatusBadge status={applicant.status} />
      </View>

      {resume.fileName ? (
        <Text style={styles.resumeInfo}>📄 Resume: {resume.fileName}</Text>
      ) : null}

      {applicant.coverNote ? (
        <View style={styles.noteBox}>
          <Text style={styles.noteLabel}>Application Info & Note:</Text>
          <Text style={styles.noteText} numberOfLines={3}>
            {applicant.coverNote}
          </Text>
        </View>
      ) : null}

      {applicant.rejectionReason ? (
        <View style={styles.rejectionBox}>
          <Text style={styles.rejectionText}>
            Rejection Note: {applicant.rejectionReason}
          </Text>
        </View>
      ) : null}

      {onUpdateStatus ? (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.reviewBtn]}
            onPress={() => onUpdateStatus(applicant._id || applicant.id, 'under_review')}
            activeOpacity={0.8}
          >
            <Text style={styles.reviewText}>🔎 Review</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.shortlistBtn]}
            onPress={() => onUpdateStatus(applicant._id || applicant.id, 'shortlisted')}
            activeOpacity={0.8}
          >
            <Text style={styles.shortlistText}>⭐ Short</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.selectBtn]}
            onPress={() => onUpdateStatus(applicant._id || applicant.id, 'selected')}
            activeOpacity={0.8}
          >
            <Text style={styles.selectText}>🎉 Select</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => onUpdateStatus(applicant._id || applicant.id, 'rejected')}
            activeOpacity={0.8}
          >
            <Text style={styles.rejectText}>✖ Reject</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBg,
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
  },
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  email: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  phone: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  atsContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },
  atsScore: {
    fontSize: theme.fontSize.md,
    fontWeight: '900',
    color: theme.colors.primaryLight,
  },
  atsLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  resumeInfo: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginVertical: 4,
    fontWeight: '600',
  },
  noteBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    padding: 10,
    borderRadius: theme.borderRadius.md,
    marginVertical: 6,
  },
  noteLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  noteText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
  rejectionBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    padding: 8,
    borderRadius: theme.borderRadius.md,
    marginVertical: 4,
  },
  rejectionText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.dangerText,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 6,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  reviewBtn: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
    borderWidth: 1,
  },
  reviewText: {
    color: '#fb923c',
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
  },
  shortlistBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
  },
  shortlistText: {
    color: theme.colors.successText,
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
  },
  selectBtn: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    borderWidth: 1,
  },
  selectText: {
    color: theme.colors.accentCyan,
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
  },
  rejectBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
  },
  rejectText: {
    color: theme.colors.dangerText,
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
  },
});
