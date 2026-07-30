import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { StatCard } from '../../components/common/StatCard';
import { recruiterApi } from '../../api/recruiterApi';
import { useAuth } from '../../context/AuthContext';

export const RecruiterDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalJobs: 0, totalApplications: 0, shortlisted: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await recruiterApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('[Recruiter stats error]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <View style={globalStyles.container}>
      <Header title={`Welcome, ${user?.fullName || 'Recruiter'} 👋`} subtitle="Recruiter Portal Dashboard" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} />}
      >
        <View style={styles.companyBanner}>
          <Text style={styles.companyName}>🏢 {user?.company || 'Recruiter Account'}</Text>
          <Text style={styles.approvedTag}>✓ Approved Recruiter</Text>
        </View>

        <Text style={globalStyles.sectionHeading}>Platform Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="My Posted Jobs"
            value={stats.totalJobs}
            icon="💼"
            accentColor={theme.colors.accent}
          />
          <StatCard
            title="Total Applications"
            value={stats.totalApplications}
            icon="📩"
            accentColor={theme.colors.primaryLight}
          />
          <StatCard
            title="Shortlisted Candidates"
            value={stats.shortlisted}
            icon="⭐"
            accentColor={theme.colors.success}
          />
        </View>

        <Text style={globalStyles.sectionHeading}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('RecruiterJobsTab')}
        >
          <Text style={{ fontSize: 24, marginRight: 12 }}>➕</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Post a New Job Opening</Text>
            <Text style={styles.actionDesc}>Create job description and specify required skills</Text>
          </View>
          <Text style={{ color: theme.colors.accent, fontWeight: 'bold' }}>Go →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('ShortlistedTab')}
        >
          <Text style={{ fontSize: 24, marginRight: 12 }}>⭐</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Shortlisted Candidates</Text>
            <Text style={styles.actionDesc}>Review top match candidates across all positions</Text>
          </View>
          <Text style={{ color: theme.colors.success, fontWeight: 'bold' }}>View →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: theme.spacing.md,
  },
  companyBanner: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: theme.colors.accent,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  companyName: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  approvedTag: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.success,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  actionCard: {
    backgroundColor: theme.colors.cardBg,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  actionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  actionDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
