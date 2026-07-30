import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { adminApi } from '../../api/adminApi';

export const ManageJobsScreen = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getJobs();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('[Admin jobs fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <View style={globalStyles.container}>
      <Header title="All Platform Jobs 📋" subtitle="Monitor all job postings" />
      <FlatList
        data={jobs}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchJobs} tintColor={theme.colors.danger} />}
        renderItem={({ item }) => (
          <View style={globalStyles.card}>
            <View style={globalStyles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.company}>
                  🏢 Company: {item.company || item.recruiterId?.company}
                </Text>
                <Text style={styles.recruiter}>
                  👤 Posted by: {item.recruiterId?.fullName || 'Recruiter'}
                </Text>
              </View>
              <Text style={styles.location}>📍 {item.location || 'Remote'}</Text>
            </View>
            <Text style={styles.date}>
              Posted: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No platform jobs found.</Text>
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
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  company: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primaryLight,
    marginTop: 2,
  },
  recruiter: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  location: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  date: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  emptyBox: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
  },
});
