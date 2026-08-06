import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { StatusBadge } from '../../components/common/StatusBadge';
import { candidateApi } from '../../api/candidateApi';

export const ApplicationsScreen = ({ navigation }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await candidateApi.getApplications();
      setApplications(data.applications || []);
    } catch (err) {
      console.error('[Applications fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusList = (app) => {
    if (Array.isArray(app?.statusHistory) && app.statusHistory.length > 0) {
      return app.statusHistory;
    }
    return [
      {
        status: app?.status ? app.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Applied',
        timestamp: app?.createdAt || new Date().toISOString(),
        updatedBy: 'Candidate',
      },
    ];
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <Header title="My Applications 📋" subtitle="Live tracking & timestamped audit trail" />
      <FlatList
        data={applications}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchApplications} tintColor={theme.colors.primaryLight} />
        }
        renderItem={({ item }) => {
          const job = item.jobId || {};
          return (
            <View style={styles.appCard}>
              <View style={globalStyles.rowBetween}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.jobTitle}>{job.title || 'Job Opening'}</Text>
                  <Text style={styles.company}>🏢 {job.company || 'Company'}</Text>
                  <Text style={styles.location}>📍 {job.location || 'Remote'}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  ATS Match:{' '}
                  <Text style={{ color: item.atsScore > 70 ? '#10b981' : item.atsScore > 40 ? '#f59e0b' : '#ef4444', fontWeight: '800' }}>
                    {item.atsScore}%
                  </Text>
                </Text>
                <Text style={styles.metaText}>
                  Applied {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                </Text>
              </View>

              {item.rejectionReason ? (
                <View style={styles.rejectionBox}>
                  <Text style={styles.rejectionTitle}>Feedback from Recruiter:</Text>
                  <Text style={styles.rejectionReason}>{item.rejectionReason}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.timelineButton}
                activeOpacity={0.8}
                onPress={() => setSelectedApp(item)}
              >
                <Text style={styles.timelineButtonText}>🕒 View Application Timeline →</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No job applications yet</Text>
              <Text style={styles.emptyDesc}>Browse open jobs and submit your resume to start tracking!</Text>
            </View>
          )
        }
      />

      {/* Application Timeline Audit Trail Modal */}
      <Modal
        visible={!!selectedApp}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedApp(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Application Timeline 🕒</Text>
                <Text style={styles.modalSub}>
                  {selectedApp?.jobId?.title || 'Role'} at {selectedApp?.jobId?.company || 'Company'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedApp(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Stepper Graphic */}
            <View style={styles.stepperContainer}>
              {['Applied', 'Under Review', 'Shortlisted', 'Selected'].map((step, idx) => {
                const historyList = getStatusList(selectedApp).map(h => (h.status || '').toLowerCase());
                const stepSlug = step.toLowerCase().replace(' ', '_');
                const isReached = historyList.some(s => s.includes(stepSlug) || s === step.toLowerCase()) || idx === 0;
                const isCurrent = (selectedApp?.status || '').toLowerCase().replace('_', ' ') === step.toLowerCase();
                return (
                  <View key={step} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepCircle,
                        isCurrent
                          ? styles.stepCircleCurrent
                          : isReached
                          ? styles.stepCircleReached
                          : styles.stepCirclePending,
                      ]}
                    >
                      <Text style={styles.stepCircleText}>{isReached ? '✓' : idx + 1}</Text>
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        isCurrent
                          ? styles.stepLabelCurrent
                          : isReached
                          ? styles.stepLabelReached
                          : styles.stepLabelPending,
                      ]}
                    >
                      {step}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Audit Trail List */}
            <ScrollView style={styles.historyList}>
              {getStatusList(selectedApp).map((h, i) => (
                <View key={i} style={styles.historyItem}>
                  <View style={styles.historyDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyStatus}>{h.status}</Text>
                    <Text style={styles.historyTime}>
                      {new Date(h.timestamp).toLocaleString()} · {h.updatedBy || 'System'}
                    </Text>
                    {h.reason ? (
                      <Text style={styles.historyReason}>Note: {h.reason}</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSelectedApp(null)}>
              <Text style={styles.modalCloseButtonText}>Close Timeline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  appCard: {
    backgroundColor: theme.colors.cardBg,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  jobTitle: {
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
  location: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  metaText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  rejectionBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  rejectionTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
    color: theme.colors.dangerText,
  },
  rejectionReason: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  timelineButton: {
    marginTop: theme.spacing.md,
    paddingVertical: 8,
    backgroundColor: 'rgba(8, 145, 178, 0.15)',
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(8, 145, 178, 0.3)',
  },
  timelineButtonText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primaryLight,
    fontWeight: '700',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(8, 145, 178, 0.35)',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  modalSub: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    fontSize: 22,
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleCurrent: {
    backgroundColor: '#06b6d4',
    borderWidth: 2,
    borderColor: '#67e8f9',
  },
  stepCircleReached: {
    backgroundColor: '#10b981',
  },
  stepCirclePending: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  stepCircleText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  stepLabel: {
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
  },
  stepLabelCurrent: {
    color: '#67e8f9',
    fontWeight: '700',
  },
  stepLabelReached: {
    color: '#34d399',
    fontWeight: '600',
  },
  stepLabelPending: {
    color: '#64748b',
  },
  historyList: {
    maxHeight: 220,
    marginBottom: theme.spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: 8,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#67e8f9',
    marginTop: 6,
    marginRight: 10,
  },
  historyStatus: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  historyTime: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  historyReason: {
    fontSize: 11,
    color: '#f87171',
    marginTop: 4,
  },
  modalCloseButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: theme.fontSize.sm,
  },
});
