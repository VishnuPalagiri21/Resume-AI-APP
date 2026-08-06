import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { CustomInput } from '../../components/common/CustomInput';
import { adminApi } from '../../api/adminApi';

export const ManageUsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data.users || []);
    } catch (err) {
      console.error('[ManageUsers fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = (userId, name) => {
    Alert.alert('Delete Candidate', `Are you sure you want to delete user "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminApi.deleteUser(userId);
            fetchUsers();
          } catch (err) {
            Alert.alert('Error', err.message || 'Failed to delete user');
          }
        },
      },
    ]);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={globalStyles.container}>
      <Header title="Candidate Directory 👤" subtitle="Manage registered job seekers" />
      <View style={styles.searchBar}>
        <CustomInput
          placeholder="Search name or email..."
          value={search}
          onChangeText={setSearch}
          icon="🔍"
          style={{ marginBottom: 0 }}
        />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchUsers} tintColor={theme.colors.warning} />}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={globalStyles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.fullName || 'Unnamed Candidate'}</Text>
                <Text style={styles.email}>📧 {item.email || 'No email'}</Text>
                {item.phone ? <Text style={styles.phone}>📞 {item.phone}</Text> : null}
                <Text style={styles.joined}>
                  Joined {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteUser(item._id || item.id, item.fullName)}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No matching candidate accounts found.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  list: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  userCard: {
    backgroundColor: theme.colors.cardBg,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  email: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  phone: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  joined: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  deleteText: {
    color: theme.colors.dangerText,
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
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
