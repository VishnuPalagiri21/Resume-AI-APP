import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export const SkillTag = ({ name, variant = 'matched' }) => {
  const isMatched = variant === 'matched';
  return (
    <View
      style={[
        styles.tag,
        isMatched ? styles.matchedTag : styles.missingTag,
      ]}
    >
      <Text style={[styles.text, isMatched ? styles.matchedText : styles.missingText]}>
        {isMatched ? '✓ ' : '✕ '}
        {name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  matchedTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: theme.colors.success,
    borderWidth: 1,
  },
  missingTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: theme.colors.danger,
    borderWidth: 1,
  },
  text: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  matchedText: {
    color: theme.colors.success,
  },
  missingText: {
    color: theme.colors.danger,
  },
});
