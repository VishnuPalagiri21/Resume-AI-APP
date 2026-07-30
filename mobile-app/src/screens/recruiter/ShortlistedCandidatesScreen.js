import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
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
      setCandidates(data.shortlisted || []);
    } catch (err) {
      console.error('[Shortlisted candidates fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShortlisted();
  }, []);

  return (
    <View style={globalStyles.container}>
      <Header title="Shortlisted Talent ⭐" subtitle="Top matched candidate profiles across your job postings" />
      <FlatList
        data={candidates}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchShortlisted} tintColor={theme.colors.success} />}
        renderItem={({ item }) => {
          const job = item.job || {};
          return (
            <View>
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>Job Position: {job.title || 'General'}</Text>
              </View>
              <ApplicantCard applicant={item} />
            </View>
          );
        }}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No shortlisted candidates</Text>
              <Text style={styles.emptyDesc}>Candidates automatically get shortlisted when ATS match score exceeds 70%.</Text>
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
  jobHeader: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
  },
  jobTitle: {
    color: theme.colors.success,
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
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
