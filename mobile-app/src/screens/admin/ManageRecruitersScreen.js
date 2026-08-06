import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { adminApi } from '../../api/adminApi';

export const ManageRecruitersScreen = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecruiters = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getRecruiters();
      setRecruiters(data.recruiters || []);
    } catch (err) {
      console.error('[ManageRecruiters fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const handleApprove = async (id, name) => {
    try {
      await adminApi.approveRecruiter(id);
      Alert.alert('Approved', `Recruiter "${name}" has been approved!`);
      fetchRecruiters();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to approve recruiter');
    }
  };

  const handleReject = async (id, name) => {
    try {
      await adminApi.rejectRecruiter(id);
      Alert.alert('Revoked', `Recruiter access for "${name}" has been revoked.`);
      fetchRecruiters();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to revoke recruiter');
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <Header title="Recruiter Approvals 🏢" subtitle="Review & authorize company recruiter accounts" />
      <FlatList
        data={recruiters}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchRecruiters} tintColor={theme.colors.warning} />}
        renderItem={({ item }) => (
          <View style={styles.recruiterCard}>
            <View style={globalStyles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.fullName || 'Anonymous Recruiter'}</Text>
                <Text style={styles.company}>🏢 Company: {item.company || 'Unknown'}</Text>
                <Text style={styles.email}>📧 {item.email || 'No email'}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  item.isApproved ? styles.approvedBadge : styles.pendingBadge,
                ]}
              >
                <Text style={[styles.statusText, item.isApproved ? styles.approvedText : styles.pendingText]}>
                  {item.isApproved ? '✓ Approved' : '⏳ Pending'}
                </Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              {!item.isApproved ? (
                <TouchableOpacity
                  style={[styles.btn, styles.approveBtn]}
                  onPress={() => handleApprove(item._id || item.id, item.fullName)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.approveText}>✓ Approve Account</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.btn, styles.revokeBtn]}
                  onPress={() => handleReject(item._id || item.id, item.fullName)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.revokeText}>✖ Revoke Approval</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No registered recruiters found.</Text>
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
  recruiterCard: {
    backgroundColor: theme.colors.cardBg,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  company: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.accentCyan,
    fontWeight: '700',
    marginTop: 2,
  },
  email: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  approvedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  approvedText: {
    color: theme.colors.successText,
  },
  pendingText: {
    color: theme.colors.warningText,
  },
  actionsRow: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  btn: {
    paddingVertical: 10,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: theme.colors.success,
    ...theme.shadows.glow,
  },
  approveText: {
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: theme.fontSize.xs,
  },
  revokeBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
  },
  revokeText: {
    color: theme.colors.dangerText,
    fontWeight: '800',
    fontSize: theme.fontSize.xs,
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
