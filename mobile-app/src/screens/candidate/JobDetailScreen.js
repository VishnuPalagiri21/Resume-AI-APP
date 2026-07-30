import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
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
      <View style={[globalStyles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={[globalStyles.container, styles.centered]}>
        <Text style={{ color: theme.colors.textPrimary }}>Job posting not found.</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Header title={job.title} subtitle={job.company || job.recruiterId?.company} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back to Jobs</Text>
        </TouchableOpacity>

        <View style={globalStyles.card}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.companyName}>🏢 {job.company || job.recruiterId?.company}</Text>
          <Text style={styles.location}>📍 Location: {job.location || 'Remote'}</Text>
          <Text style={styles.salary}>💰 Salary Range: {job.salaryRange || 'Competitive'}</Text>
          <Text style={styles.postedAt}>
            📅 Posted on: {new Date(job.createdAt).toLocaleDateString()}
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
          onPress={() => navigation.navigate('ApplyJobModal', { jobId: job._id, jobTitle: job.title })}
          style={{ marginVertical: theme.spacing.lg }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: theme.spacing.md,
  },
  backBtn: {
    marginBottom: theme.spacing.md,
  },
  backText: {
    color: theme.colors.primaryLight,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  jobTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  companyName: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primaryLight,
    fontWeight: '600',
    marginTop: 4,
  },
  location: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 6,
  },
  salary: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
    fontWeight: '600',
    marginTop: 4,
  },
  postedAt: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 6,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  skillPill: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: theme.colors.primary,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: theme.colors.primaryLight,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  descriptionText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    lineHeight: 24,
  },
});
