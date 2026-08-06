import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { Header } from '../../components/common/Header';
import { KPICard } from '../../components/common/KPICard';
import { adminApi } from '../../api/adminApi';

/**
 * Fintech-Style Light Admin Dashboard (Image 1 Design System)
 * #F5F6FA background, pure white (#FFFFFF) cards, soft shadows, dark navy typography,
 * and reusable <KPICard /> components with native SVG sparklines.
 */
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
    <SafeAreaView style={styles.pageContainer}>
      <Header
        title="Admin Overview 🛡️"
        subtitle="Platform governance & management console"
        showMenu={true}
        lightTheme={true}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Pending Alert (Only shown if pendingRecruiters > 0) ── */}
        {stats.pendingRecruiters > 0 ? (
          <TouchableOpacity
            style={styles.pendingAlert}
            onPress={() => navigation.navigate('AdminRecruitersTab')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Review Pending Recruiter Registrations"
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>⚠️ Action Required</Text>
              <Text style={styles.alertText}>
                {stats.pendingRecruiters} Pending Recruiter Registration(s)
                Require Approval
              </Text>
            </View>
            <Text style={styles.alertArrow}>Review →</Text>
          </TouchableOpacity>
        ) : null}

        {/* ── Platform Analytics (<KPICard /> Grid) ── */}
        <Text style={styles.sectionTitle}>Platform Analytics</Text>
        <View style={styles.statsGrid}>
          <KPICard
            title="Candidate Users"
            value={stats.totalUsers}
            icon="👥"
            delta="+12% mo"
            isPositive={true}
            accentColor="#3B82F6"
            sparklineData={[100, 105, 112, 120, 130, 140, 150]}
            onPress={() => navigation.navigate('AdminUsersTab')}
          />
          <KPICard
            title="Approved Recruiters"
            value={stats.totalRecruiters}
            icon="🏢"
            delta="+5 this mo"
            isPositive={true}
            accentColor="#7C3AED"
            sparklineData={[10, 11, 12, 14, 15, 16, 18]}
            onPress={() => navigation.navigate('AdminRecruitersTab')}
          />
          <KPICard
            title="Pending Approvals"
            value={stats.pendingRecruiters}
            icon="⏳"
            delta="urgent"
            isPositive={stats.pendingRecruiters === 0}
            accentColor="#F59E0B"
            sparklineData={[0, 1, 1, 2, 3, 2, stats.pendingRecruiters || 0]}
            onPress={() => navigation.navigate('AdminRecruitersTab')}
          />
          <KPICard
            title="Total Platform Jobs"
            value={stats.totalJobs}
            icon="💼"
            delta="+8% mo"
            isPositive={true}
            accentColor="#10B981"
            sparklineData={[20, 22, 25, 28, 30, 32, 35]}
            onPress={() => navigation.navigate('AdminJobsTab')}
          />
          <KPICard
            title="Job Applications"
            value={stats.totalApplications}
            icon="📩"
            delta="+24% mo"
            isPositive={true}
            accentColor="#0284C7"
            sparklineData={[50, 60, 75, 85, 95, 110, 130]}
          />
        </View>

        {/* ── Administrative Console Shortcuts ── */}
        <Text style={styles.sectionTitle}>Administrative Shortcuts</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminRecruitersTab')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Recruiter Approval Portal"
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#FEF3C7' }]}>
            <Text style={{ fontSize: 18 }}>🏢</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Recruiter Approval Portal</Text>
            <Text style={styles.actionDesc}>
              Approve or revoke company recruiter registrations
            </Text>
          </View>
          <View style={[styles.pillBtn, { backgroundColor: '#FEF3C7' }]}>
            <Text style={{ color: '#D97706', fontSize: 12, fontWeight: '700' }}>
              Review →
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminUsersTab')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Candidate User Directory"
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#EEF2FF' }]}>
            <Text style={{ fontSize: 18 }}>👤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Candidate User Directory</Text>
            <Text style={styles.actionDesc}>
              View registered candidates and manage accounts
            </Text>
          </View>
          <View style={[styles.pillBtn, { backgroundColor: '#EEF2FF' }]}>
            <Text style={{ color: '#4F46E5', fontSize: 12, fontWeight: '700' }}>
              View →
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AdminJobsTab')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="All Platform Jobs"
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#ECFDF5' }]}>
            <Text style={{ fontSize: 18 }}>📋</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>All Platform Jobs</Text>
            <Text style={styles.actionDesc}>
              Monitor active job postings across recruiters
            </Text>
          </View>
          <View style={[styles.pillBtn, { backgroundColor: '#ECFDF5' }]}>
            <Text style={{ color: '#059669', fontSize: 12, fontWeight: '700' }}>
              Monitor →
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#F5F6FA', // Light Fintech Gray Background
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  pendingAlert: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 2,
  },
  alertText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
  },
  alertArrow: {
    color: '#B45309',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F1A3C',
  },
  actionDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },
  pillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
});
