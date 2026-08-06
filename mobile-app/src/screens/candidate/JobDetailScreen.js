import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { CustomButton } from '../../components/common/CustomButton';
import { candidateApi } from '../../api/candidateApi';

export const JobDetailScreen = ({ route, navigation }) => {
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await candidateApi.getJobById(jobId);
        setJob(data);
      } catch (err) {
        console.error('[JobDetail fetch error]', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primaryLight} />
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.centered]}>
        <Text style={{ color: theme.colors.textPrimary }}>Job posting not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <Header title={job.title} subtitle={job.company || job.recruiterId?.company} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back to Jobs</Text>
        </TouchableOpacity>

        {/* Hero job card */}
        <View style={styles.heroCard}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.companyName}>🏢 {job.company || job.recruiterId?.company}</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailBadge}>
              <Text style={styles.detailText}>📍 {job.location || 'Remote'}</Text>
            </View>
            <View style={[styles.detailBadge, styles.salaryBadge]}>
              <Text style={styles.salaryText}>💰 {job.salaryRange || 'Competitive'}</Text>
            </View>
          </View>

          <Text style={styles.postedAt}>
            📅 Posted {new Date(job.createdAt || Date.now()).toLocaleDateString()}
          </Text>
        </View>

        <Text style={globalStyles.sectionHeading}>Required Skills</Text>
        <View style={styles.skillsRow}>
          {(job.skillsRequired || []).map((skill, idx) => (
            <View key={idx} style={styles.skillPill}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>

        <Text style={globalStyles.sectionHeading}>Job Description</Text>
        <View style={globalStyles.card}>
          <Text style={styles.descriptionText}>{job.description}</Text>
        </View>

        <CustomButton
          title="Apply for this Position"
          onPress={() => navigation.navigate('ApplyJobModal', { jobId: job._id || job.id, jobTitle: job.title })}
          style={{ marginVertical: theme.spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  backBtn: {
    marginBottom: theme.spacing.md,
  },
  backText: {
    color: theme.colors.primaryLight,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  heroCard: {
    backgroundColor: theme.colors.cardBg,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  jobTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  companyName: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primaryLight,
    fontWeight: '700',
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: theme.spacing.sm,
  },
  detailBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  detailText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  salaryBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  salaryText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.successText,
    fontWeight: '800',
  },
  postedAt: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
    gap: 6,
  },
  skillPill: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  skillText: {
    color: theme.colors.primaryLight,
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
  descriptionText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    lineHeight: 24,
  },
});
