import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const globalStyles = StyleSheet.create({
  // Base container — matches web bg #03060A
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgDark,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: theme.spacing.md,
  },

  // Glass card — matches web stellar-card
  card: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.xl,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },

  // Greeting/banner card — matches web stellar-greeting-card
  greetingCard: {
    borderRadius: theme.borderRadius.xxl,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },

  // Row utilities
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Typography — matches web Outfit headings
  titleText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: theme.spacing.xs,
  },
  subtitleText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
    fontWeight: '500',
  },
  sectionHeading: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.3,
  },

  // Section label — matches web stellar-nav-section-label
  sectionLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: theme.spacing.sm,
  },

  // Badge pill — matches web badge styles
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryGlowBg,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderWidth: 1,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
    color: theme.colors.primaryLight,
    letterSpacing: 0.5,
  },

  // Chip tag
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    marginVertical: theme.spacing.md,
  },

  // Avatar circle — matches web stellar-avatar-circle
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...theme.shadows.glowCyan,
  },
  avatarText: {
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: theme.fontSize.md,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
