import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export const AtsScoreGauge = ({ score }) => {
  const getScoreColor = (val) => {
    if (val >= 75) return theme.colors.success;
    if (val >= 50) return theme.colors.warning;
    return theme.colors.danger;
  };

  const color = getScoreColor(score);

  return (
    <View style={styles.container}>
      <View style={[styles.circle, { borderColor: color }]}>
        <Text style={[styles.scoreText, { color }]}>{score}</Text>
        <Text style={styles.labelText}>ATS Score</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.md,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
  },
  scoreText: {
    fontSize: theme.fontSize.xxl + 4,
    fontWeight: 'bold',
  },
  labelText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginTop: -2,
  },
});
