import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../styles/theme';

/**
 * SaaS Structural StatCard Component
 * Implements clean grid sizing (46% width in 2-col mobile layout),
 * uniform 16px padding, 16px corner radius, and number-first visual hierarchy.
 */
export const StatCard = ({
  title,
  value,
  icon,
  accentColor = theme.colors.primary,
  onPress,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={`${title}: ${value ?? 0}`}
    >
      {icon ? (
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: `${accentColor}14`,
              borderColor: `${accentColor}2E`,
            },
          ]}
        >
          <Text style={styles.icon}>{icon}</Text>
        </View>
      ) : null}

      <Text style={styles.valueText} numberOfLines={1}>
        {value ?? 0}
      </Text>

      <Text style={styles.labelText} numberOfLines={1}>
        {title}
      </Text>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%', // Ensures uniform 2-column grid alignment on mobile
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.09)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    marginBottom: 8,
    ...theme.shadows.sm,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 16,
  },
  valueText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
