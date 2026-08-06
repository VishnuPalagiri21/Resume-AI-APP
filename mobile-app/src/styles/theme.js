/**
 * ResumeAI Mobile Theme
 * Precisely mirrors the web app CSS design tokens from index.css
 * Web identity: near-black bg, violet+cyan brand, glass cards, dot-grid
 */
export const theme = {
  colors: {
    // Backgrounds (matches web: #030305 / #03060a)
    bgDark:      '#03060A',       // web --bg
    bgSecondary: '#070C14',       // web sidebar: rgba(4,8,14,0.65)
    bgCard:      '#0D1117',       // elevated surface

    // Glass Card surfaces (web: rgba(255,255,255,0.025))
    cardBg:      'rgba(255, 255, 255, 0.025)',
    cardBgHover: 'rgba(255, 255, 255, 0.045)',
    cardBorder:  'rgba(255, 255, 255, 0.08)',
    cardBorderHover: 'rgba(255, 255, 255, 0.18)',

    // Input surface (web: rgba(255,255,255,0.08))
    inputBg:     'rgba(255, 255, 255, 0.06)',
    inputBorder: 'rgba(255, 255, 255, 0.10)',
    inputFocus:  '#6366F1',

    // Brand (web: --brand-primary #8b5cf6, --brand-secondary #06b6d4)
    primary:       '#8B5CF6',   // violet
    primaryDark:   '#7C3AED',
    primaryLight:  '#A78BFA',   // lighter violet
    primaryGlow:   'rgba(139, 92, 246, 0.35)',
    primaryGlowBg: 'rgba(139, 92, 246, 0.15)',

    accent:        '#06B6D4',   // cyan (web brand-secondary)
    accentCyan:    '#06B6D4',   // cyan alias for tab navigators
    accentGlow:    'rgba(6, 182, 212, 0.3)',
    accentBg:      'rgba(6, 182, 212, 0.12)',

    blue:          '#3B82F6',
    blueGlow:      'rgba(59, 130, 246, 0.3)',

    // Nav active (web: inset 2px 0 0 #06b6d4)
    navActiveBg:   'rgba(139, 92, 246, 0.16)',
    navActiveBorder: '#06B6D4',

    // Status
    success:    '#10B981',
    successBg:  'rgba(16, 185, 129, 0.15)',
    successBorder: 'rgba(16, 185, 129, 0.3)',
    successText: '#34D399',

    warning:    '#F59E0B',
    warningBg:  'rgba(245, 158, 11, 0.15)',
    warningBorder: 'rgba(245, 158, 11, 0.3)',
    warningText: '#FBBF24',

    danger:     '#EF4444',
    dangerBg:   'rgba(239, 68, 68, 0.15)',
    dangerBorder: 'rgba(239, 68, 68, 0.3)',
    dangerText: '#F87171',

    info:       '#6366F1',
    infoBg:     'rgba(99, 102, 241, 0.15)',

    // Typography (web: --text #f3f4f6, --text-muted #9ca3af)
    textPrimary:   '#F3F4F6',
    textSecondary: '#9CA3AF',
    textMuted:     '#64748B',
    white:         '#FFFFFF',
  },

  spacing: {
    xs:  4,
    sm:  8,
    md:  16,
    lg:  24,
    xl:  32,
    xxl: 48,
  },

  borderRadius: {
    xs:   4,
    sm:   8,
    md:   12,
    lg:   16,
    xl:   20,   // web stellar-card: border-radius: 20px
    xxl:  24,   // web --radius-lg: 24px
    full: 9999,
  },

  fontSize: {
    xs:   11,   // web: 0.72rem
    sm:   13,   // web: 0.82-0.85rem
    md:   15,   // web: 0.95rem body
    lg:   18,   // web: 1.1rem
    xl:   22,   // web: 1.4rem
    xxl:  28,   // web: 1.8-2rem
    xxxl: 34,   // web: h1
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 8,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.6,
      shadowRadius: 40,
      elevation: 12,
    },
    // Violet glow (web: box-shadow: 0 8px 24px rgba(139,92,246,0.4))
    glow: {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 20,
      elevation: 10,
    },
    // Cyan glow (web: box-shadow: 0 4px 14px rgba(6,182,212,0.35))
    glowCyan: {
      shadowColor: '#06B6D4',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 14,
      elevation: 8,
    },
  },
};
