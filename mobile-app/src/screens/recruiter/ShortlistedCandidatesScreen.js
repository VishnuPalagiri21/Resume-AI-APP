import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { ApplicantCard } from '../../components/recruiter/ApplicantCard';
import { recruiterApi } from '../../api/recruiterApi';

export const ShortlistedCandidatesScreen = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShortlisted = async () => {
    setLoading(true);
    try {
      const data = await recruiterApi.getShortlistedCandidates();
      setCandidates(data.shortlisted || data.applicants || []);
    } catch (err) {
      console.error('[Shortlisted candidates fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShortlisted();
  }, []);

  const handleUpdateStatus = async (applicantId, status) => {
    try {
      await recruiterApi.updateApplicantStatus(applicantId, status);
      setCandidates((prev) =>
        prev.map((item) =>
          (item._id === applicantId || item.id === applicantId) ? { ...item, status } : item
        )
      );
    } catch (err) {
      console.error('[Update status error]', err);
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <Header title="Shortlisted Talent ⭐" subtitle="Top matched candidate profiles across your job postings" />
      <FlatList
        data={candidates}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchShortlisted} tintColor={theme.colors.successText} />}
        renderItem={({ item }) => {
          const job = item.jobId || item.job || {};
          return (
            <View style={styles.cardContainer}>
              {job.title ? (
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>
                    ROLE: {job.title.toUpperCase()} {job.company ? `· ${job.company}` : ''}
                  </Text>
                </View>
              ) : null}
              <ApplicantCard applicant={item} onUpdateStatus={handleUpdateStatus} />
            </View>
          );
        }}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No shortlisted candidates</Text>
              <Text style={styles.emptyDesc}>Candidates marked as "Shortlisted" will appear here!</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  cardContainer: {
    marginBottom: theme.spacing.md,
  },
  jobHeader: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  jobTitle: {
    color: theme.colors.successText,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  emptyBox: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
  },
  emptyDesc: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    marginTop: 4,
    textAlign: 'center',
  },
});
