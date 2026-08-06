import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

/**
 * Reusable <KPICard /> Component (Fintech Light Design System - Image 1)
 * Pure white card (#FFFFFF) with soft box-shadow, colored circular icon badge (32x32px),
 * small uppercase gray label, large bold number, colored delta badge (▲green/▼red),
 * and lightweight inline SVG sparkline trend chart underneath.
 */
export const KPICard = ({
  title,
  value,
  icon,
  delta = '+12%',
  isPositive = true,
  accentColor = '#3B82F6',
  sparklineData = [10, 18, 14, 25, 22, 30, 28],
  onPress,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  // Generate simple SVG path from sparklineData array (7-10 data points)
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;

    const width = 110;
    const height = 28;
    const maxVal = Math.max(...sparklineData, 1);
    const minVal = Math.min(...sparklineData, 0);
    const range = maxVal - minVal || 1;

    const points = sparklineData.map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 4) - 2;
      return { x, y };
    });

    const linePath = points.reduce((acc, pt, idx) => {
      return idx === 0
        ? `M ${pt.x} ${pt.y}`
        : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

    const gradientId = `grad_${title.replace(/\s+/g, '')}`;

    return (
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={accentColor} stopOpacity="0.25" />
            <Stop offset="1" stopColor={accentColor} stopOpacity="0.01" />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill={`url(#${gradientId})`} />
        <Path
          d={linePath}
          stroke={accentColor}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  };

  return (
    <Container
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={`${title}: ${value ?? 0}, delta: ${delta}`}
    >
      {/* Top Row: Colored circular icon badge & Delta indicator */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconBadge,
            { backgroundColor: `${accentColor}1A` }, // Soft 10% opacity badge
          ]}
        >
          <Text style={styles.iconText}>{icon || '📊'}</Text>
        </View>

        <View
          style={[
            styles.deltaBadge,
            {
              backgroundColor: isPositive ? '#D1FAE5' : '#FEE2E2',
            },
          ]}
        >
          <Text
            style={[
              styles.deltaText,
              { color: isPositive ? '#059669' : '#DC2626' },
            ]}
          >
            {isPositive ? '▲ ' : '▼ '}
            {delta}
          </Text>
        </View>
      </View>

      {/* Main Numeral: Largest Bold Element */}
      <Text style={styles.valueText} numberOfLines={1}>
        {value ?? 0}
      </Text>

      {/* Uppercase Gray Label for Context */}
      <Text style={styles.labelText} numberOfLines={1}>
        {title}
      </Text>

      {/* Lightweight Inline Sparkline Chart */}
      <View style={styles.sparklineContainer}>{renderSparkline()}</View>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%', // 2x2 responsive grid alignment on mobile
    backgroundColor: '#FFFFFF',
    borderRadius: 16, // 16px border-radius matching Image 1
    padding: 16,
    marginHorizontal: 4,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 15,
  },
  deltaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  deltaText: {
    fontSize: 11,
    fontWeight: '700',
  },
  valueText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F1A3C', // Dark Navy typography
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B', // Small gray uppercase label
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  sparklineContainer: {
    height: 28,
    width: '100%',
    overflow: 'hidden',
  },
});
