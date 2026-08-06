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
import { recruiterApi } from '../../api/recruiterApi';
import { useAuth } from '../../context/AuthContext';

/**
 * Fintech-Style Light Recruiter Dashboard (Image 1 & Image 2 Design System)
 * #F5F6FA background, pure white (#FFFFFF) cards, soft shadows, dark navy typography,
 * and complete 8-card recruitment lifecycle <KPICard /> grid matching the Web App.
 */
export const RecruiterDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    underReview: 0,
    shortlisted: 0,
    selected: 0,
    rejected: 0,
    openPositions: 0,
    closedPositions: 0,
  });
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
    <SafeAreaView style={styles.pageContainer}>
      <Header
        title={`Welcome, ${user?.fullName?.split(' ')[0] || 'Recruiter'}`}
        subtitle="Company Hiring & Talent Suite"
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
        {/* ── Company Workspace Card (White Card on #F5F6FA) ── */}
        <View style={styles.companyBanner}>
          <View style={styles.companyTopRow}>
            <View>
              <Text style={styles.companyBadge}>COMPANY WORKSPACE</Text>
              <Text style={styles.companyName}>
                🏢 {user?.company || 'Recruiter Account'}
              </Text>
            </View>
            <View style={styles.approvedPill}>
              <Text style={styles.approvedTag}>✓ Approved</Text>
            </View>
          </View>
        </View>

        {/* ── Hiring Overview (Complete 8-Card <KPICard /> Grid) ── */}
        <Text style={styles.sectionTitle}>Hiring Overview</Text>
        <View style={styles.statsGrid}>
          <KPICard
            title="Posted Jobs"
            value={stats.totalJobs || 0}
            icon="💼"
            delta="+2 jobs"
            isPositive={true}
            accentColor="#3B82F6"
            sparklineData={[2, 4, 3, 5, 6, 7, 10]}
            onPress={() => navigation.navigate('RecruiterJobs')}
          />
          <KPICard
            title="Total Applications"
            value={stats.totalApplications || 0}
            icon="📥"
            delta="+15% wk"
            isPositive={true}
            accentColor="#7C3AED"
            sparklineData={[10, 14, 18, 22, 25, 28, 35]}
            onPress={() => navigation.navigate('AllApplications')}
          />
          <KPICard
            title="Under Review"
            value={stats.underReview || 0}
            icon="🔎"
            delta="+4 today"
            isPositive={true}
            accentColor="#F59E0B"
            sparklineData={[2, 3, 5, 4, 6, 8, 9]}
            onPress={() => navigation.navigate('AllApplications', { filterStatus: 'under_review' })}
          />
          <KPICard
            title="Shortlisted"
            value={stats.shortlisted || 0}
            icon="⭐"
            delta="+3 today"
            isPositive={true}
            accentColor="#10B981"
            sparklineData={[1, 2, 2, 4, 5, 7, 9]}
            onPress={() => navigation.navigate('ShortlistedCandidates')}
          />
          <KPICard
            title="Selected"
            value={stats.selected || 0}
            icon="🎉"
            delta="+2 this wk"
            isPositive={true}
            accentColor="#059669"
            sparklineData={[0, 1, 1, 2, 3, 4, 5]}
            onPress={() => navigation.navigate('SelectedCandidates')}
          />
          <KPICard
            title="Rejected"
            value={stats.rejected || 0}
            icon="✖"
            delta="Archived"
            isPositive={false}
            accentColor="#EF4444"
            sparklineData={[1, 1, 2, 2, 3, 4, 4]}
            onPress={() => navigation.navigate('RejectedCandidates')}
          />
          <KPICard
            title="Open Positions"
            value={stats.openPositions || 0}
            icon="🟢"
            delta="Active"
            isPositive={true}
            accentColor="#10B981"
            sparklineData={[1, 2, 2, 3, 4, 5, 6]}
            onPress={() => navigation.navigate('RecruiterJobs')}
          />
          <KPICard
            title="Closed Positions"
            value={stats.closedPositions || 0}
            icon="🔴"
            delta="Closed"
            isPositive={false}
            accentColor="#64748B"
            sparklineData={[0, 0, 1, 1, 1, 2, 2]}
            onPress={() => navigation.navigate('RecruiterJobs')}
          />
        </View>

        {/* ── Recruitment Actions ── */}
        <Text style={styles.sectionTitle}>Recruitment Actions</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('RecruiterJobs')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Post a New Job Opening"
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#EEF2FF' }]}>
            <Text style={{ fontSize: 18 }}>➕</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Post a New Job Opening</Text>
            <Text style={styles.actionDesc}>
              Define role requirements, compensation & ATS filters
            </Text>
          </View>
          <View style={[styles.pillBtn, { backgroundColor: '#EEF2FF' }]}>
            <Text style={{ color: '#4F46E5', fontSize: 12, fontWeight: '700' }}>
              Post →
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AllApplications')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Review All Applications"
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#EFF6FF' }]}>
            <Text style={{ fontSize: 18 }}>📥</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Review Candidate Applications</Text>
            <Text style={styles.actionDesc}>
              Filter by stage, check ATS match scores & update statuses
            </Text>
          </View>
          <View style={[styles.pillBtn, { backgroundColor: '#EFF6FF' }]}>
            <Text style={{ color: '#3B82F6', fontSize: 12, fontWeight: '700' }}>
              Review →
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('ShortlistedCandidates')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Review Shortlisted Candidates"
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#ECFDF5' }]}>
            <Text style={{ fontSize: 18 }}>⭐</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Review Shortlisted Talent</Text>
            <Text style={styles.actionDesc}>
              Inspect high ATS-ranking applicants and resumes
            </Text>
          </View>
          <View style={[styles.pillBtn, { backgroundColor: '#ECFDF5' }]}>
            <Text style={{ color: '#059669', fontSize: 12, fontWeight: '700' }}>
              View →
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('SelectedCandidates')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="View Selected Hires"
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#ECFEFF' }]}>
            <Text style={{ fontSize: 18 }}>🎉</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>View Selected Hires</Text>
            <Text style={styles.actionDesc}>
              Finalized candidate selections and offer stages
            </Text>
          </View>
          <View style={[styles.pillBtn, { backgroundColor: '#ECFEFF' }]}>
            <Text style={{ color: '#0891B2', fontSize: 12, fontWeight: '700' }}>
              Hired →
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
  companyBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  companyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3B82F6',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F1A3C',
    letterSpacing: -0.5,
  },
  approvedPill: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  approvedTag: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
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
