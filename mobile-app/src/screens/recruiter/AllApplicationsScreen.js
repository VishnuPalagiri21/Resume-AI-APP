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

export const AllApplicationsScreen = ({ route, navigation }) => {
  const initialFilter = route?.params?.filterStatus || 'all';
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(initialFilter);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await recruiterApi.getAllApplicants();
      setApplicants(data.applicants || []);
    } catch (err) {
      console.error('[AllApplications fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (applicationId, status) => {
    if (status === 'rejected') {
      Alert.prompt(
        'Rejection Reason',
        'Optional: Enter feedback or reason for candidate rejection:',
        async (rejectionReason) => {
          try {
            await recruiterApi.updateApplicantStatus(applicationId, status, rejectionReason);
            fetchApplications();
          } catch (err) {
            Alert.alert('Error', err.message || 'Failed to update status');
          }
        }
      );
    } else {
      try {
        await recruiterApi.updateApplicantStatus(applicationId, status);
        fetchApplications();
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
      <Header
        title="All Applications 👥"
        subtitle="Manage candidate pipeline across all jobs"
        showMenu={true}
        lightTheme={true}
      />
      <View style={styles.banner}>
        <Text style={styles.infoText}>
          ⚡ Live candidate tracking & AI ATS score rankings across all open postings.
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
          <RefreshControl refreshing={loading} onRefresh={fetchApplications} tintColor="#3B82F6" />
        }
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
              <Text style={styles.emptyTitle}>No applications found</Text>
              <Text style={styles.emptyDesc}>
                {filterStatus === 'all'
                  ? 'Candidate applications across your posted jobs will appear here.'
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  infoText: {
    color: '#4F46E5',
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  filterBarContainer: {
    backgroundColor: '#0F1A3C',
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
    paddingBottom: theme.spacing.xxl,
  },
  cardContainer: {
    marginBottom: theme.spacing.md,
  },
  jobHeader: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  jobTitle: {
    color: '#3B82F6',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
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
