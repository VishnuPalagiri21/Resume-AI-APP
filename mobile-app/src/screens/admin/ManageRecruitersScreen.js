import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
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
    <View style={globalStyles.container}>
      <Header title="Recruiter Approvals 🏢" subtitle="Review & authorize company recruiter accounts" />
      <FlatList
        data={recruiters}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchRecruiters} tintColor={theme.colors.danger} />}
        renderItem={({ item }) => (
          <View style={globalStyles.card}>
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
                  onPress={() => handleApprove(item._id, item.fullName)}
                >
                  <Text style={styles.approveText}>✓ Approve Account</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.btn, styles.revokeBtn]}
                  onPress={() => handleReject(item._id, item.fullName)}
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
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.md,
  },
  name: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  company: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.accent,
    fontWeight: '600',
    marginTop: 2,
  },
  email: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  approvedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
  },
  approvedText: {
    color: theme.colors.success,
  },
  pendingText: {
    color: theme.colors.warning,
  },
  actionsRow: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  btn: {
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: theme.colors.success,
  },
  approveText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: theme.fontSize.xs,
  },
  revokeBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: theme.colors.danger,
    borderWidth: 1,
  },
  revokeText: {
    color: theme.colors.danger,
    fontWeight: 'bold',
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
