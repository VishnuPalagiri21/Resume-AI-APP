import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { CustomButton } from '../../components/common/CustomButton';
import { useAuth } from '../../context/AuthContext';

export const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const initials = (user?.fullName || 'PV').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={globalStyles.container}>
      <Header title="My Profile 👤" subtitle="Account details & session controls" showLogout={false} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar header matching web avatar circle */}
        <View style={styles.avatarBox}>
          <View style={globalStyles.avatarCircle}>
            <Text style={globalStyles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.fullName || 'User Profile'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>ROLE: {user?.role?.toUpperCase() || 'USER'}</Text>
          </View>
        </View>

        {/* Account Details Glass Card */}
        <View style={globalStyles.card}>
          <Text style={styles.cardHeading}>Account Overview</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.val}>{user?.fullName || 'N/A'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Email Address</Text>
            <Text style={styles.val}>{user?.email}</Text>
          </View>

          {user?.company ? (
            <View style={styles.row}>
              <Text style={styles.label}>Company</Text>
              <Text style={styles.val}>{user.company}</Text>
            </View>
          ) : null}

          {user?.phone ? (
            <View style={styles.row}>
              <Text style={styles.label}>Phone Number</Text>
              <Text style={styles.val}>{user.phone}</Text>
            </View>
          ) : null}

          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.label}>Platform Access</Text>
            <Text style={[styles.val, { color: theme.colors.accent }]}>Verified Member</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <CustomButton
          title="Sign Out of Session"
          variant="danger"
          onPress={logout}
          style={{ marginTop: theme.spacing.md }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  avatarBox: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.sm,
  },
  name: {
    fontSize: theme.fontSize.xl,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    marginTop: 12,
    letterSpacing: -0.4,
  },
  email: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.sm,
  },
  roleText: {
    fontSize: 10,
    color: theme.colors.primaryLight,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cardHeading: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    letterSpacing: -0.3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  val: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
});
