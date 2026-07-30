import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export const StatCard = ({ title, value, icon, accentColor = theme.colors.primary }) => {
  return (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.value, { color: accentColor }]}>{value ?? 0}</Text>
      </View>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    backgroundColor: theme.colors.cardBg,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    margin: theme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
  },
  icon: {
    fontSize: 24,
    marginLeft: theme.spacing.xs,
  },
});
