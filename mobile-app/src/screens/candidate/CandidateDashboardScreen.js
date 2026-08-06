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
import { JobCard } from '../../components/candidate/JobCard';
import { candidateApi } from '../../api/candidateApi';
import { useAuth } from '../../context/AuthContext';

/**
 * Fintech-Style Light Candidate Dashboard (Image 1 Design System)
 * Implements #F5F6FA background, pure white (#FFFFFF) cards with soft shadows,
 * dark navy (#0F1A3C) typography, and reusable <KPICard /> components with native sparklines,
 * while preserving 100% of existing functionality, API calls, and business logic.
 */
export const CandidateDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    resumeCount: 0,
    applicationCount: 0,
    activeJobs: 0,
    streakDays: 5,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        candidateApi
          .getStats()
          .catch(() => ({
            resumeCount: 0,
            applicationCount: 0,
            activeJobs: 0,
          })),
        candidateApi.getJobs().catch(() => ({ jobs: [] })),
      ]);
      setStats(statsRes);
      setRecentJobs((jobsRes.jobs || []).slice(0, 3));
    } catch (err) {
      console.error('[Dashboard fetch error]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const todayStr = new Date()
    .toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    .toUpperCase();
  const firstName = user?.fullName?.split(' ')[0] || 'SEEKER';

  return (
    <SafeAreaView style={styles.pageContainer}>
      <Header
        title="Dashboard"
        subtitle="AI-Powered Resume & Job Search"
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
        {/* ── 1. Welcome Card (White Card on Light Gray #F5F6FA) ── */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeDate}>☀️ {todayStr}</Text>
          <Text style={styles.welcomeTitle}>
            Good to see you,{' '}
            <Text style={{ color: '#3B82F6' }}>
              {firstName.toUpperCase()}
            </Text>
          </Text>
          <Text style={styles.welcomeBody}>
            Here's what's happening with your job search and ATS scans today.
          </Text>

          <View style={styles.pillRow}>
            <View
              style={[
                styles.pill,
                { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
              ]}
            >
              <Text style={[styles.pillText, { color: '#4F46E5' }]}>
                📄 {stats.resumeCount || 0} Resumes
              </Text>
            </View>
            <View
              style={[
                styles.pill,
                { backgroundColor: '#ECFEFF', borderColor: '#A5F3FC' },
              ]}
            >
              <Text style={[styles.pillText, { color: '#0891B2' }]}>
                🚀 {stats.applicationCount || 0} Applied
              </Text>
            </View>
            <View
              style={[
                styles.pill,
                { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
              ]}
            >
              <Text style={[styles.pillText, { color: '#059669' }]}>
                💼 {stats.activeJobs || 0} Open
              </Text>
            </View>
            {stats.underReview > 0 ? (
              <View
                style={[
                  styles.pill,
                  { backgroundColor: '#FFF7ED', borderColor: '#FDE68A' },
                ]}
              >
                <Text style={[styles.pillText, { color: '#EA580C' }]}>
                  🔎 {stats.underReview} Under Review
                </Text>
              </View>
            ) : null}
            {stats.shortlisted > 0 ? (
              <View
                style={[
                  styles.pill,
                  { backgroundColor: '#F3E8FF', borderColor: '#DDD6FE' },
                ]}
              >
                <Text style={[styles.pillText, { color: '#7C3AED' }]}>
                  ⭐ {stats.shortlisted} Shortlisted
                </Text>
              </View>
            ) : null}
            {stats.selected > 0 ? (
              <View
                style={[
                  styles.pill,
                  { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
                ]}
              >
                <Text style={[styles.pillText, { color: '#059669' }]}>
                  🎉 {stats.selected} Selected
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── 2. Top Metric Row (<KPICard /> 2x2 Responsive Grid) ── */}
        <Text style={styles.sectionTitle}>Key Performance Metrics</Text>
        <View style={styles.statsGrid}>
          <KPICard
            title="Resumes Uploaded"
            value={stats.resumeCount}
            icon="📄"
            delta="+2 this wk"
            isPositive={true}
            accentColor="#3B82F6"
            sparklineData={[3, 5, 4, 6, 8, 7, 10]}
            onPress={() => navigation.navigate('ResumeUpload')}
          />
          <KPICard
            title="Jobs Applied"
            value={stats.applicationCount}
            icon="🚀"
            delta="+18%"
            isPositive={true}
            accentColor="#7C3AED"
            sparklineData={[10, 12, 14, 18, 20, 24, 28]}
            onPress={() => navigation.navigate('ApplicationsTab')}
          />
          <KPICard
            title="Active Listings"
            value={stats.activeJobs}
            icon="🔥"
            delta="+12%"
            isPositive={true}
            accentColor="#10B981"
            sparklineData={[40, 42, 38, 45, 48, 50, 54]}
            onPress={() => navigation.navigate('JobsTab')}
          />
          <KPICard
            title="Day Streak"
            value={stats.streakDays || 5}
            icon="⚡"
            delta="+1 day"
            isPositive={true}
            accentColor="#F59E0B"
            sparklineData={[1, 2, 3, 3, 4, 5, 5]}
          />
        </View>

        {/* ── 3. Primary Hero Action (AI ATS Scanner Card) ── */}
        <TouchableOpacity
          style={styles.atsBanner}
          onPress={() => navigation.navigate('ResumeUpload')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Analyze Resume with AI"
        >
          <View style={{ flex: 1 }}>
            <View style={styles.atsBadge}>
              <Text style={styles.atsBadgeText}>✨ GEMINI AI ENGINE</Text>
            </View>
            <Text style={styles.atsTitle}>Analyze Resume with AI</Text>
            <Text style={styles.atsDesc}>
              Check ATS score, missing skills & get suggestions
            </Text>
          </View>
          <View style={styles.atsArrow}>
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>
              →
            </Text>
          </View>
        </TouchableOpacity>

        {/* ── 4. Secondary Tool (Resume LaTeX Editor Card) ── */}
        <TouchableOpacity
          style={styles.editorCard}
          onPress={() => navigation.navigate('LatexEditorTab')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Resume Editor"
        >
          <View style={styles.editorIconBox}>
            <Text style={{ fontSize: 18 }}>✏️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.editorTitle}>Resume Editor</Text>
            <Text style={styles.editorDesc}>
              Build & compile LaTeX PDF resumes with AI
            </Text>
          </View>
          <View style={styles.openPill}>
            <Text style={styles.openPillText}>Open →</Text>
          </View>
        </TouchableOpacity>

        {/* ── 5. Structured List Feed (Job Search & Activity) ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Featured Openings</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('JobsTab')}
            activeOpacity={0.7}
          >
            <Text style={styles.browseAll}>Browse All →</Text>
          </TouchableOpacity>
        </View>

        {recentJobs.length > 0 ? (
          recentJobs.map((job) => (
            <JobCard
              key={job._id || job.id}
              job={job}
              onPress={() =>
                navigation.navigate('JobDetail', { jobId: job._id || job.id })
              }
              onApply={() =>
                navigation.navigate('ApplyJobModal', {
                  jobId: job._id || job.id,
                  jobTitle: job.title,
                })
              }
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No job postings available right now. Pull down to refresh.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#F5F6FA', // Light Gray Fintech Background (Image 1)
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeDate: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F1A3C', // Dark Navy Typography
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  welcomeBody: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 19,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
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
  atsBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6', // Blue accent stripe
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  atsBadge: {
    backgroundColor: '#EEF2FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  atsBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
    letterSpacing: 0.8,
  },
  atsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F1A3C',
    letterSpacing: -0.2,
  },
  atsDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  atsArrow: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#3B82F6', // Accent blue CTA button
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  editorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  editorIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  editorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F1A3C',
  },
  editorDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },
  openPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  openPillText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  browseAll: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 13,
  },
});
