import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { CustomButton } from '../../components/common/CustomButton';
import { CustomInput } from '../../components/common/CustomInput';
import { recruiterApi } from '../../api/recruiterApi';

export const RecruiterJobsScreen = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Remote');
  const [salaryRange, setSalaryRange] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await recruiterApi.getJobs();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('[RecruiterJobs fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handlePostJob = async () => {
    if (!title || !description) {
      Alert.alert('Required', 'Title and Description are required');
      return;
    }

    const skillsRequired = skillsStr
      ? skillsStr.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    setPosting(true);
    try {
      await recruiterApi.createJob({
        title,
        description,
        location,
        salaryRange,
        skillsRequired,
      });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setSalaryRange('');
      setSkillsStr('');
      fetchJobs();
      Alert.alert('Success', 'Job opening posted successfully!');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to post job');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteJob = (jobId) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this job posting?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await recruiterApi.deleteJob(jobId);
            fetchJobs();
          } catch (err) {
            Alert.alert('Error', err.message || 'Failed to delete job');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <Header title="Job Postings 💼" subtitle="Manage your open positions" />
      <View style={styles.topAction}>
        <CustomButton
          title="+ Post New Job Opening"
          variant="secondary"
          onPress={() => setShowCreateModal(true)}
        />
      </View>

      {showCreateModal ? (
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Post New Job Opening</Text>
          <CustomInput label="Job Title" placeholder="e.g. Senior React Developer" value={title} onChangeText={setTitle} />
          <CustomInput label="Location" placeholder="e.g. Remote / New York, NY" value={location} onChangeText={setLocation} />
          <CustomInput label="Salary Range" placeholder="e.g. $120,000 - $150,000" value={salaryRange} onChangeText={setSalaryRange} />
          <CustomInput label="Required Skills (Comma separated)" placeholder="React, Node.js, TypeScript" value={skillsStr} onChangeText={setSkillsStr} />
          <CustomInput label="Job Description" placeholder="Detailed responsibilities..." value={description} onChangeText={setDescription} multiline numberOfLines={4} />

          <View style={{ flexDirection: 'row', gap: 8, marginTop: theme.spacing.md }}>
            <CustomButton title="Cancel" variant="outline" onPress={() => setShowCreateModal(false)} style={{ flex: 1 }} />
            <CustomButton title={posting ? 'Publishing...' : 'Publish Job'} variant="secondary" onPress={handlePostJob} loading={posting} style={{ flex: 1 }} />
          </View>
        </View>
      ) : null}

      <FlatList
        data={jobs}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchJobs} tintColor={theme.colors.primaryLight} />}
        renderItem={({ item }) => (
          <View style={styles.jobCard}>
            <View style={globalStyles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.company}>🏢 {item.company}</Text>
                <Text style={styles.location}>📍 {item.location} {item.salaryRange ? `• 💰 ${item.salaryRange}` : ''}</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.viewApplicantsBtn}
                onPress={() => navigation.navigate('JobApplicants', { jobId: item._id || item.id, jobTitle: item.title })}
              >
                <Text style={styles.viewApplicantsText}>👥 View Ranked Applicants →</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteJob(item._id || item.id)}>
                <Text style={styles.deleteText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No job postings created</Text>
              <Text style={styles.emptyDesc}>Tap "+ Post New Job Opening" to list your first job position!</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topAction: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  list: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  modalBox: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: 'rgba(6, 182, 212, 0.4)',
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
    ...theme.shadows.glowCyan,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.3,
  },
  jobCard: {
    backgroundColor: theme.colors.cardBg,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  jobTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  location: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  salaryBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  salaryText: {
    fontSize: 10,
    color: theme.colors.successText,
    fontWeight: '800',
  },
  desc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.sm,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  viewApplicantsBtn: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  viewApplicantsText: {
    color: theme.colors.primaryLight,
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteText: {
    color: theme.colors.dangerText,
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
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
