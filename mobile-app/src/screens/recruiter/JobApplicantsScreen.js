import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { ApplicantCard } from '../../components/recruiter/ApplicantCard';
import { recruiterApi } from '../../api/recruiterApi';

export const JobApplicantsScreen = ({ route, navigation }) => {
  const { jobId, jobTitle } = route.params;
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <View style={globalStyles.container}>
      <Header title="Candidate Rankings 👥" subtitle={jobTitle} />
      <View style={styles.banner}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back to Jobs</Text>
        </TouchableOpacity>
        <Text style={styles.infoText}>
          ⚡ Applicants sorted automatically by AI ATS match score.
        </Text>
      </View>

      <FlatList
        data={applicants}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchApplicants} tintColor={theme.colors.accent} />}
        renderItem={({ item }) => (
          <ApplicantCard applicant={item} onUpdateStatus={handleUpdateStatus} />
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No candidates applied yet</Text>
              <Text style={styles.emptyDesc}>Candidates will appear here sorted by ATS score once applications arrive.</Text>
            </View>
          )
        }
      />
    </View>
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
