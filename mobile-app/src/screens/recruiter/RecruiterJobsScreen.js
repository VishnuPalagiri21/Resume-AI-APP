import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
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
    <View style={globalStyles.container}>
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
            <CustomButton title="Publish Job" variant="secondary" onPress={handlePostJob} loading={posting} style={{ flex: 1 }} />
          </View>
        </View>
      ) : null}

      <FlatList
        data={jobs}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchJobs} tintColor={theme.colors.accent} />}
        renderItem={({ item }) => (
          <View style={globalStyles.card}>
            <View style={globalStyles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.location}>📍 {item.location || 'Remote'}</Text>
              </View>
              <Text style={styles.salary}>{item.salaryRange || 'Competitive'}</Text>
            </View>

            <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.viewApplicantsBtn}
                onPress={() => navigation.navigate('JobApplicants', { jobId: item._id, jobTitle: item.title })}
              >
                <Text style={styles.viewApplicantsText}>👥 View Ranked Applicants →</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteJob(item._id)}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  topAction: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  list: {
    padding: theme.spacing.md,
  },
  modalBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: theme.colors.accent,
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  jobTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  location: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  salary: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.success,
    fontWeight: 'bold',
  },
  desc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  viewApplicantsBtn: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: theme.colors.primary,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  viewApplicantsText: {
    color: theme.colors.primaryLight,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.xs,
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
