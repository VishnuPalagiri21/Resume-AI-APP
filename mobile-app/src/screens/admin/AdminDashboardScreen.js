import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { StatCard } from '../../components/common/StatCard';
import { adminApi } from '../../api/adminApi';

export const AdminDashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecruiters: 0,
    pendingRecruiters: 0,
    totalJobs: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('[Admin stats error]', err);
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
      <Header title="Admin Overview 🛡️" subtitle="Platform analytics & management console" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.danger} />}
      >
        {stats.pendingRecruiters > 0 ? (
          <TouchableOpacity
            style={styles.pendingAlert}
            onPress={() => navigation.navigate('AdminRecruitersTab')}
          >
            <Text style={styles.alertText}>
              ⚠️ {stats.pendingRecruiters} Pending Recruiter Registration(s) Require Approval →
            </Text>
          </TouchableOpacity>
        ) : null}

        <Text style={globalStyles.sectionHeading}>Platform Metrics</Text>
        <View style={styles.statsGrid}>
          <StatCard title="Candidate Users" value={stats.totalUsers} icon="👥" accentColor={theme.colors.primaryLight} />
          <StatCard title="Approved Recruiters" value={stats.totalRecruiters} icon="🏢" accentColor={theme.colors.accent} />
          <StatCard title="Pending Approvals" value={stats.pendingRecruiters} icon="⏳" accentColor={theme.colors.warning} />
          <StatCard title="Total Platform Jobs" value={stats.totalJobs} icon="💼" accentColor={theme.colors.success} />
          <StatCard title="Job Applications" value={stats.totalApplications} icon="📩" accentColor={theme.colors.accentCyan} />
        </View>

        <Text style={globalStyles.sectionHeading}>Administrative Actions</Text>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('AdminRecruitersTab')}
        >
          <Text style={{ fontSize: 24, marginRight: 12 }}>🏢</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Recruiter Approval Portal</Text>
            <Text style={styles.menuDesc}>Approve or revoke company recruiter registrations</Text>
          </View>
          <Text style={{ color: theme.colors.warning, fontWeight: 'bold' }}>Review →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('AdminUsersTab')}
        >
          <Text style={{ fontSize: 24, marginRight: 12 }}>👤</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Candidate User Directory</Text>
            <Text style={styles.menuDesc}>View registered candidates and manage accounts</Text>
          </View>
          <Text style={{ color: theme.colors.primaryLight, fontWeight: 'bold' }}>View →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('AdminJobsTab')}
        >
          <Text style={{ fontSize: 24, marginRight: 12 }}>📋</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>All Platform Jobs</Text>
            <Text style={styles.menuDesc}>Monitor active job postings across recruiters</Text>
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
  pendingAlert: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: theme.colors.warning,
    borderWidth: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  alertText: {
    color: theme.colors.warning,
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  menuCard: {
    backgroundColor: theme.colors.cardBg,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  menuTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  menuDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
