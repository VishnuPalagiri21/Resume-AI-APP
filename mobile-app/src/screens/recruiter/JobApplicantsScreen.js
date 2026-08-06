import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { ApplicantCard } from '../../components/recruiter/ApplicantCard';
import { recruiterApi } from '../../api/recruiterApi';

export const JobApplicantsScreen = ({ route, navigation }) => {
  const { jobId, jobTitle } = route.params;
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const data = await recruiterApi.getApplicantsForJob(jobId);
      setApplicants(data.applicants || []);
    } catch (err) {
      console.error('[JobApplicants fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const handleUpdateStatus = async (applicationId, status) => {
    if (status === 'rejected') {
      Alert.prompt(
        'Rejection Reason',
        'Optional: Enter feedback or reason for candidate rejection:',
        async (rejectionReason) => {
          try {
            await recruiterApi.updateApplicantStatus(applicationId, status, rejectionReason);
            fetchApplicants();
          } catch (err) {
            Alert.alert('Error', err.message || 'Failed to update status');
          }
        }
      );
    } else {
      try {
        await recruiterApi.updateApplicantStatus(applicationId, status);
        fetchApplicants();
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to update status');
      }
    }
  };

  const filteredApplicants = applicants.filter((a) => {
    if (filterStatus === 'all') return true;
    const st = (a.status || 'applied').toLowerCase().replace(' ', '_');
    return st === filterStatus;
  });

  return (
    <SafeAreaView style={globalStyles.container}>
      <Header title="Candidate Rankings 👥" subtitle={jobTitle} />
      <View style={styles.banner}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back to Jobs</Text>
        </TouchableOpacity>
        <Text style={styles.infoText}>
          ⚡ Applicants sorted automatically by AI ATS match score.
        </Text>
      </View>

      {/* Status Filter Pill Bar */}
      <View style={styles.filterBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}>
          {['All', 'Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected'].map((statusOption) => {
            const value =
              statusOption === 'All'
                ? 'all'
                : statusOption.toLowerCase().replace(' ', '_');
            const isSelected = filterStatus === value;
            return (
              <TouchableOpacity
                key={statusOption}
                style={[
                  styles.filterPill,
                  isSelected ? styles.filterPillActive : styles.filterPillInactive,
                ]}
                onPress={() => setFilterStatus(value)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected ? styles.filterPillTextActive : styles.filterPillTextInactive,
                  ]}
                >
                  {statusOption}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredApplicants}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchApplicants} tintColor="#3B82F6" />
        }
        renderItem={({ item }) => (
          <ApplicantCard applicant={item} onUpdateStatus={handleUpdateStatus} />
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No applicants found</Text>
              <Text style={styles.emptyDesc}>
                {filterStatus === 'all'
                  ? 'Candidates will appear here sorted by ATS score once applications arrive.'
                  : `No applications currently matching status "${filterStatus}".`}
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
    backgroundColor: theme.colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  backBtn: {
    marginBottom: 4,
  },
  backText: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  infoText: {
    color: theme.colors.primaryLight,
    fontSize: theme.fontSize.xs,
    fontWeight: '500',
  },
  filterBarContainer: {
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterBar: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
  },
  filterPillActive: {
    backgroundColor: 'rgba(8, 145, 178, 0.2)',
    borderColor: '#06b6d4',
  },
  filterPillInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterPillTextActive: {
    color: '#67e8f9',
  },
  filterPillTextInactive: {
    color: theme.colors.textMuted,
  },
  list: {
    padding: theme.spacing.md,
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
