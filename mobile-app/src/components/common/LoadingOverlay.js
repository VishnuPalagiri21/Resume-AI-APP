import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={theme.colors.primaryLight} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 25, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  card: {
    backgroundColor: theme.colors.cardBg,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.glow,
  },
  message: {
    marginTop: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
