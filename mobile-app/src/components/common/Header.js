import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../styles/theme';
import { useDrawer } from '../../context/DrawerContext';

/**
 * Fintech Light Design System Header (Image 1)
 * Clean light background (#FFFFFF), right-aligned avatar badge or custom icon slot,
 * accessible 48x48 touch targets, and dark navy sans-serif typography.
 */
export const Header = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightElement,
  showMenu = true,
  lightTheme = true,
}) => {
  const { openDrawer } = useDrawer();

  return (
    <View
      style={[
        styles.container,
        lightTheme ? styles.containerLight : styles.containerDark,
      ]}
    >
      <View style={styles.leftRow}>
        {showBack && onBack ? (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              lightTheme ? styles.actionBtnLight : styles.actionBtnDark,
            ]}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back to previous screen"
          >
            <Text
              style={[
                styles.iconText,
                lightTheme ? styles.iconTextLight : styles.iconTextDark,
              ]}
            >
              ←
            </Text>
          </TouchableOpacity>
        ) : showMenu ? (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              lightTheme ? styles.menuBtnLight : styles.menuBtnDark,
            ]}
            onPress={openDrawer}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Open Navigation Drawer"
          >
            <Text
              style={[
                styles.iconText,
                lightTheme ? styles.iconTextLight : styles.iconTextDark,
              ]}
            >
              ☰
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.brandDot} />
        )}

        <View style={styles.titleBox}>
          <Text
            style={[
              styles.title,
              lightTheme ? styles.titleLight : styles.titleDark,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                lightTheme ? styles.subtitleLight : styles.subtitleDark,
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {rightElement ? (
        <View style={styles.rightSlot}>{rightElement}</View>
      ) : (
        /* Default Fintech Right-Aligned Notification Bell & Avatar Badge */
        <View style={styles.rightDefaultRow}>
          <TouchableOpacity
            style={[
              styles.notifBtn,
              lightTheme ? styles.notifBtnLight : styles.notifBtnDark,
            ]}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Text style={styles.notifIcon}>🔔</Text>
          </TouchableOpacity>
          <View style={styles.avatarSlot}>
            <View style={styles.defaultAvatar}>
              <Text style={styles.avatarInitials}>AI</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  containerDark: {
    backgroundColor: 'rgba(3, 6, 10, 0.96)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  leftRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  actionBtnLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  actionBtnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuBtnLight: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  menuBtnDark: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  iconText: {
    fontSize: 20,
    fontWeight: '700',
  },
  iconTextLight: {
    color: '#0F1A3C',
  },
  iconTextDark: {
    color: '#F3F4F6',
  },
  titleBox: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  titleLight: {
    color: '#0F1A3C',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  subtitleLight: {
    color: '#64748B',
  },
  subtitleDark: {
    color: '#CBD5E1',
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  rightSlot: {
    marginLeft: 12,
  },
  rightDefaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBtnLight: {
    backgroundColor: '#F1F5F9',
  },
  notifBtnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  notifIcon: {
    fontSize: 16,
  },
  avatarSlot: {
    marginLeft: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#818CF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4F46E5',
  },
});
