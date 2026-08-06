import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { CustomInput } from '../../components/common/CustomInput';
import { JobCard } from '../../components/candidate/JobCard';
import { candidateApi } from '../../api/candidateApi';

export const JobSearchScreen = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchJobs = async (searchQuery = search, skillQuery = skill) => {
    setLoading(true);
    try {
      const data = await candidateApi.getJobs(searchQuery, skillQuery);
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('[JobSearch fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearchChange = (text) => {
    setSearch(text);
    fetchJobs(text, skill);
  };

  const handleSkillChange = (text) => {
    setSkill(text);
    fetchJobs(search, text);
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <Header title="Browse Jobs 💼" subtitle="Discover and apply for active opportunities" />
      <View style={styles.filterContainer}>
        <CustomInput
          placeholder="Search job title, company..."
          value={search}
          onChangeText={handleSearchChange}
          icon="🔍"
          style={{ marginBottom: theme.spacing.xs }}
        />
        <CustomInput
          placeholder="Skill filter (e.g., React, Python)"
          value={skill}
          onChangeText={handleSkillChange}
          icon="⚡"
          style={{ marginBottom: 0 }}
        />
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchJobs(search, skill)} tintColor={theme.colors.primaryLight} />}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onPress={() => navigation.navigate('JobDetail', { jobId: item._id || item.id })}
            onApply={() => navigation.navigate('ApplyJobModal', { jobId: item._id || item.id, jobTitle: item.title })}
          />
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No matching jobs found</Text>
              <Text style={styles.emptyDesc}>Try adjusting your search query or skill filter.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  list: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
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
