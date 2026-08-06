import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { ApplicantCard } from '../../components/recruiter/ApplicantCard';
import { recruiterApi } from '../../api/recruiterApi';

export const RejectedCandidatesScreen = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRejected = async () => {
    setLoading(true);
    try {
      const data = await recruiterApi.getRejectedCandidates();
      setCandidates(data.rejected || data.applicants || []);
    } catch (err) {
      console.error('[Rejected candidates fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejected();
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
      Alert.alert('Error', err.message || 'Failed to update status');
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <Header
        title="Rejected Applications ✖"
        subtitle="Archived & rejected candidate profiles"
        showMenu={true}
        lightTheme={true}
      />
      <View style={styles.banner}>
        <Text style={styles.infoText}>
          ⚡ Candidates who were not selected for this hiring cycle.
        </Text>
      </View>
      <FlatList
        data={candidates}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchRejected} tintColor="#EF4444" />
        }
        renderItem={({ item }) => {
          const job = item.jobId || item.job || {};
          return (
            <View style={styles.cardContainer}>
              {job.title ? (
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>
                    ARCHIVED ROLE: {job.title.toUpperCase()} {job.company ? `· ${job.company}` : ''}
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
              <Text style={styles.emptyTitle}>No rejected candidates</Text>
              <Text style={styles.emptyDesc}>
                Candidates moved to the "Rejected" stage will appear here.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  infoText: {
    color: '#DC2626',
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  list: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  cardContainer: {
    marginBottom: theme.spacing.md,
  },
  jobHeader: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  jobTitle: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  emptyBox: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#0F1A3C',
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
  },
  emptyDesc: {
    color: '#64748B',
    fontSize: theme.fontSize.sm,
    marginTop: 4,
    textAlign: 'center',
  },
});
