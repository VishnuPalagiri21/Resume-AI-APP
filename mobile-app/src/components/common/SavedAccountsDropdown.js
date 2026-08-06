import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../styles/theme';

export const SavedAccountsDropdown = ({
  role = 'candidate',
  accounts = [],
  onSelectAccount,
  onRemoveAccount,
}) => {
  if (!accounts || accounts.length === 0) return null;

  const getRoleBadge = () => {
    const r = role.toLowerCase();
    if (r === 'recruiter') return { label: 'SAVED RECRUITER ACCOUNTS', color: theme.colors.accent };
    if (r === 'admin') return { label: 'SAVED ADMIN ACCOUNTS', color: theme.colors.warning };
    return { label: 'SAVED CANDIDATE ACCOUNTS', color: theme.colors.primaryLight };
  };

  const badge = getRoleBadge();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, { color: badge.color }]}>{badge.label}</Text>
      </View>

      {accounts.map((item) => (
        <TouchableOpacity
          key={item.email}
          style={styles.accountRow}
          onPress={() => onSelectAccount(item)}
          activeOpacity={0.7}
        >
          <View style={styles.leftInfo}>
            <Text style={styles.icon}>👤</Text>
            <View>
              <Text style={styles.emailText} numberOfLines={1}>
                {item.email}
              </Text>
              <Text style={styles.subText}>Tap to autofill</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => onRemoveAccount(item.email)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.removeText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(13, 17, 23, 0.98)',
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    marginTop: -theme.spacing.xs,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  headerRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  icon: {
    fontSize: 16,
    marginRight: 10,
  },
  emailText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  removeBtn: {
    padding: 6,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  removeText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
