import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { StatCard } from '../../components/common/StatCard';
import { JobCard } from '../../components/candidate/JobCard';
import { candidateApi } from '../../api/candidateApi';
import { useAuth } from '../../context/AuthContext';

export const CandidateDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ resumeCount: 0, applicationCount: 0, activeJobs: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        candidateApi.getStats().catch(() => ({ resumeCount: 0, applicationCount: 0, activeJobs: 0 })),
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

  return (
    <View style={globalStyles.container}>
      <Header
        title={`Hello, ${user?.fullName || 'Candidate'}! 👋`}
        subtitle="Resume AI Candidate Dashboard"
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* Quick Upload Banner */}
        <TouchableOpacity
          style={styles.banner}
          onPress={() => navigation.navigate('ResumeUpload')}
          activeOpacity={0.85}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerBadge}>✨ AI ATS ENGINE</Text>
            <Text style={styles.bannerTitle}>Analyze Resume with AI</Text>
            <Text style={styles.bannerDesc}>
              Upload your PDF resume to check ATS score, missing skills & AI suggestions.
            </Text>
          </View>
          <Text style={styles.bannerArrow}>➔</Text>
        </TouchableOpacity>

        {/* Stats Grid */}
        <Text style={globalStyles.sectionHeading}>Your Activity</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Analyzed Resumes"
            value={stats.resumeCount}
            icon="📄"
            accentColor={theme.colors.primaryLight}
          />
          <StatCard
            title="Applications"
            value={stats.applicationCount}
            icon="💼"
            accentColor={theme.colors.success}
          />
          <StatCard
            title="Active Openings"
            value={stats.activeJobs}
            icon="🔥"
            accentColor={theme.colors.accent}
          />
        </View>

        {/* LaTeX Editor Shortcut */}
        <TouchableOpacity
          style={styles.editorBanner}
          onPress={() => navigation.navigate('LatexEditorTab')}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 24 }}>📝</Text>
          <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <Text style={styles.editorTitle}>LaTeX Resume Builder</Text>
            <Text style={styles.editorDesc}>Create & compile professional LaTeX resumes with AI</Text>
          </View>
          <Text style={{ color: theme.colors.accentCyan, fontWeight: 'bold' }}>Open →</Text>
        </TouchableOpacity>

        {/* Recommended Jobs */}
        <View style={globalStyles.rowBetween}>
          <Text style={globalStyles.sectionHeading}>Featured Openings</Text>
          <TouchableOpacity onPress={() => navigation.navigate('JobsTab')}>
            <Text style={styles.seeAllText}>Browse All →</Text>
          </TouchableOpacity>
        </View>

        {recentJobs.length > 0 ? (
          recentJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onPress={() => navigation.navigate('JobDetail', { jobId: job._id })}
              onApply={() => navigation.navigate('ApplyJobModal', { jobId: job._id, jobTitle: job.title })}
            />
          ))
        ) : (
          <View style={globalStyles.card}>
            <Text style={{ color: theme.colors.textMuted, textAlign: 'center' }}>
              No job postings available at the moment.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: theme.spacing.md,
  },
  banner: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  bannerBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.primaryLight,
    letterSpacing: 1,
  },
  bannerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginVertical: 2,
  },
  bannerDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  bannerArrow: {
    fontSize: 22,
    color: theme.colors.primaryLight,
    marginLeft: theme.spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  editorBanner: {
    backgroundColor: theme.colors.cardBg,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  editorTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  editorDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  seeAllText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryLight,
    fontWeight: '600',
  },
});
