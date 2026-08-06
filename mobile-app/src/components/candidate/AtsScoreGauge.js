import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { theme } from '../../styles/theme';

export const AtsScoreGauge = ({ score = 0, size = 150, strokeWidth = 12 }) => {
  const normalizedScore = Math.min(100, Math.max(0, Number(score) || 0));

  const getScoreDetails = (val) => {
    if (val >= 75) {
      return {
        color: theme.colors.success,
        bgGlow: 'rgba(16, 185, 129, 0.15)',
        label: 'Strong Match',
        badgeBg: 'rgba(16, 185, 129, 0.2)',
      };
    }
    if (val >= 50) {
      return {
        color: theme.colors.warning,
        bgGlow: 'rgba(245, 158, 11, 0.15)',
        label: 'Moderate Match',
        badgeBg: 'rgba(245, 158, 11, 0.2)',
      };
    }
    return {
      color: theme.colors.danger,
      bgGlow: 'rgba(239, 68, 68, 0.15)',
      label: 'Needs Work',
      badgeBg: 'rgba(239, 68, 68, 0.2)',
    };
  };

  const details = getScoreDetails(normalizedScore);

  // Radius & circumference calculation for SVG circle
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <View style={styles.container}>
      <View style={[styles.gaugeWrapper, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            {/* Background Circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress Arc */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={details.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </G>
        </Svg>

        {/* Center Content */}
        <View style={styles.centerContent}>
          <Text style={[styles.scoreValue, { color: details.color }]}>
            {normalizedScore}
          </Text>
          <Text style={styles.percentSymbol}>%</Text>
        </View>
      </View>

      {/* Rating Pill Badge */}
      <View style={[styles.badge, { backgroundColor: details.badgeBg, borderColor: details.color }]}>
        <Text style={[styles.badgeText, { color: details.color }]}>
          {details.label.toUpperCase()}
        </Text>
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
  gaugeWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  percentSymbol: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    marginLeft: 2,
  },
  badge: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
