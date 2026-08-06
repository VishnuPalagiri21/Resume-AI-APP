import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={globalStyles.container}>
      <Header title="All Platform Jobs 📋" subtitle="Monitor all job postings" />
      <FlatList
        data={jobs}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchJobs} tintColor={theme.colors.warning} />}
        renderItem={({ item }) => (
          <View style={styles.jobCard}>
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
              <View style={styles.locationPill}>
                <Text style={styles.locationText}>📍 {item.location || 'Remote'}</Text>
              </View>
            </View>
            <Text style={styles.date}>
              Posted {new Date(item.createdAt || Date.now()).toLocaleDateString()}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  jobCard: {
    backgroundColor: theme.colors.cardBg,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  company: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primaryLight,
    fontWeight: '700',
    marginTop: 2,
  },
  recruiter: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  locationPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
  },
  locationText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  date: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
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
