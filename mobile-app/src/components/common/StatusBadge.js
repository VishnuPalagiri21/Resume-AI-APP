import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export const StatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status?.toLowerCase()) {
      case 'shortlisted':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: theme.colors.success, label: '⭐ Shortlisted' };
      case 'selected':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: theme.colors.accent, label: '🎉 Selected' };
      case 'rejected':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: theme.colors.danger, label: '✖ Rejected' };
      case 'applied':
      default:
        return { bg: 'rgba(139, 92, 246, 0.15)', text: theme.colors.primaryLight, label: '⏳ Applied' };
    }
  };

  const { bg, text, label } = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
});
