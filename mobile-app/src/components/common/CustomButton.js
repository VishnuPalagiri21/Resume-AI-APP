import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { theme } from '../../styles/theme';

/**
 * Refined CustomButton Component
 * Strict refinement: 52px touch target height, 50% reduced glow, subtle press opacity (0.85),
 * and clean sans-serif typography.
 */
export const CustomButton = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getStyle = () => {
    if (disabled) return styles.disabled;
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      case 'danger':
        return styles.danger;
      case 'ghost':
        return styles.ghost;
      default:
        return styles.primary;
    }
  };

  const getTextStyle = () => {
    if (disabled) return styles.textDisabled;
    if (variant === 'outline') return styles.textOutline;
    if (variant === 'ghost') return styles.textGhost;
    return styles.textDefault;
  };

  return (
    <TouchableOpacity
      style={[styles.base, getStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85} // Subtle press feedback
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'outline' || variant === 'ghost'
              ? theme.colors.primaryLight
              : '#FFFFFF'
          }
          size="small"
        />
      ) : (
        <Text style={[styles.textBase, getTextStyle(), textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 52, // 48dp+ accessible touch target
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primary: {
    backgroundColor: '#7C3AED',
    borderColor: 'rgba(167, 139, 250, 0.35)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22, // ~50% reduced glow
    shadowRadius: 10,
    elevation: 4,
  },
  secondary: {
    backgroundColor: theme.colors.accent,
    borderColor: 'rgba(6, 182, 212, 0.35)',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, // ~50% reduced glow
    shadowRadius: 8,
    elevation: 4,
  },
  outline: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  danger: {
    backgroundColor: theme.colors.danger,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    shadowColor: theme.colors.danger,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  textBase: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  textDefault: {
    color: '#FFFFFF',
  },
  textOutline: {
    color: '#A78BFA',
  },
  textGhost: {
    color: '#CBD5E1',
  },
  textDisabled: {
    color: '#64748B',
  },
});
