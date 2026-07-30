import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { StatusBadge } from '../../components/common/StatusBadge';
import { candidateApi } from '../../api/candidateApi';

export const ApplicationsScreen = ({ navigation }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await candidateApi.getApplications();
      setApplications(data.applications || []);
    } catch (err) {
      console.error('[Applications fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <View style={globalStyles.container}>
      <Header title="My Applications 💼" subtitle="Track application statuses & recruiter updates" />
      <FlatList
        data={applications}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchApplications} tintColor={theme.colors.primary} />
        }
        renderItem={({ item }) => {
          const job = item.jobId || {};
          return (
            <View style={globalStyles.card}>
              <View style={globalStyles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle}>{job.title || 'Job Opening'}</Text>
                  <Text style={styles.company}>🏢 {job.company || 'Company'}</Text>
                  <Text style={styles.location}>📍 {job.location || 'Remote'}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  ATS Score: <Text style={{ color: theme.colors.success, fontWeight: 'bold' }}>{item.atsScore}%</Text>
                </Text>
                <Text style={styles.metaText}>
                  Applied: {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>

              {item.rejectionReason ? (
                <View style={styles.rejectionBox}>
                  <Text style={styles.rejectionTitle}>Feedback from Recruiter:</Text>
                  <Text style={styles.rejectionReason}>{item.rejectionReason}</Text>
                </View>
              ) : null}
            </View>
          );
        }}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No job applications yet</Text>
              <Text style={styles.emptyDesc}>Browse open jobs and submit your resume to start tracking!</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.md,
  },
  jobTitle: {
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
  location: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  metaText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  rejectionBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm,
  },
  rejectionTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
    color: theme.colors.danger,
  },
  rejectionReason: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  emptyBox: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
  emptyDesc: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    marginTop: 4,
    textAlign: 'center',
  },
});
