import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { CustomButton } from '../../components/common/CustomButton';
import { useAuth } from '../../context/AuthContext';

export const ProfileScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={globalStyles.container}>
      <Header title="My Profile 👤" subtitle="Account details & session controls" showLogout={false} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarBox}>
          <Text style={{ fontSize: 48 }}>👤</Text>
          <Text style={styles.name}>{user?.fullName || 'User Profile'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Role: {user?.role?.toUpperCase() || 'USER'}</Text>
          </View>
        </View>

        <View style={globalStyles.card}>
          <Text style={styles.cardHeading}>Account Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.val}>{user?.fullName || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.val}>{user?.email}</Text>
          </View>
          {user?.company ? (
            <View style={styles.row}>
              <Text style={styles.label}>Company:</Text>
              <Text style={styles.val}>{user.company}</Text>
            </View>
          ) : null}
          {user?.phone ? (
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.val}>{user.phone}</Text>
            </View>
          ) : null}
        </View>

        <CustomButton
          title="Sign Out of Session"
          variant="danger"
          onPress={logout}
          style={{ marginTop: theme.spacing.lg }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: theme.spacing.md,
  },
  avatarBox: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  name: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginTop: 8,
  },
  email: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: theme.colors.primary,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.xs,
  },
  roleText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primaryLight,
    fontWeight: 'bold',
  },
  cardHeading: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  val: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
});
