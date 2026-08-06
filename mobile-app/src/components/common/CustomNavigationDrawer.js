import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDrawer } from '../../context/DrawerContext';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.84, 320);

export const CustomNavigationDrawer = () => {
  const { isDrawerOpen, closeDrawer, activeRoute, setActiveRoute } = useDrawer();
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isDrawerOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isDrawerOpen]);

  const role = user?.role || 'user';
  const fullName = user?.fullName || user?.email?.split('@')[0] || 'ResumeAI User';
  const email = user?.email || 'user@resumeai.com';
  const initials = fullName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleBadgeText =
    role === 'recruiter'
      ? '🏢 Verified Recruiter'
      : role === 'admin'
      ? '🛡️ System Administrator'
      : '⚡ PRO Job Seeker';

  const roleAccentColor =
    role === 'recruiter'
      ? theme.colors.accentCyan
      : role === 'admin'
      ? theme.colors.warning
      : theme.colors.primaryLight;

  // ── Categorized Sections & Route Mappings ──
  const getSections = () => {
    if (role === 'recruiter') {
      return [
        {
          title: 'RECRUITMENT OVERVIEW',
          items: [
            {
              id: 'RecruiterDashboard',
              title: 'Recruiter Dashboard',
              subtitle: 'Active jobs, stats & metrics',
              icon: '📊',
              route: 'RecruiterDashboard',
            },
          ],
        },
        {
          title: 'JOB MANAGEMENT',
          items: [
            {
              id: 'MyPostedJobs',
              title: 'My Posted Jobs',
              subtitle: 'Manage postings & statuses',
              icon: '💼',
              route: 'RecruiterJobs',
            },
            {
              id: 'PostNewJob',
              title: 'Post New Job',
              subtitle: 'Create & publish opportunity',
              icon: '➕',
              route: 'RecruiterJobs',
              params: { openCreateModal: true },
            },
          ],
        },
        {
          title: 'CANDIDATES & TALENT',
          items: [
            {
              id: 'AllApplications',
              title: 'All Applications',
              subtitle: 'Pipeline across all jobs',
              icon: '👥',
              route: 'AllApplications',
            },
            {
              id: 'ShortlistedCandidates',
              title: 'Shortlisted Candidates',
              subtitle: 'Saved top talent profiles',
              icon: '⭐',
              route: 'ShortlistedCandidates',
            },
            {
              id: 'SelectedCandidates',
              title: 'Selected Hires',
              subtitle: 'Finalized candidate offers',
              icon: '🎉',
              route: 'SelectedCandidates',
            },
            {
              id: 'RejectedCandidates',
              title: 'Rejected Applications',
              subtitle: 'Archived candidate profiles',
              icon: '✖',
              route: 'RejectedCandidates',
            },
          ],
        },
        {
          title: 'ACCOUNT & SETTINGS',
          items: [
            {
              id: 'RecruiterProfile',
              title: 'Recruiter Profile',
              subtitle: 'Company info & preferences',
              icon: '🏢',
              route: 'RecruiterProfile',
            },
          ],
        },
      ];
    }

    if (role === 'admin') {
      return [
        {
          title: 'SYSTEM OVERVIEW',
          items: [
            {
              id: 'PlatformOverview',
              title: 'Platform Overview',
              subtitle: 'System analytics & health',
              icon: '🛡️',
              route: 'AdminDashboard',
            },
          ],
        },
        {
          title: 'USER & RECRUITER MANAGEMENT',
          items: [
            {
              id: 'ManageRecruiters',
              title: 'Manage Recruiters',
              subtitle: 'Approvals & verification',
              icon: '🏢',
              route: 'AdminRecruiters',
            },
            {
              id: 'ManageCandidates',
              title: 'Manage Candidates',
              subtitle: 'User accounts & roles',
              icon: '👥',
              route: 'AdminUsers',
            },
          ],
        },
        {
          title: 'JOB & PLATFORM ADMIN',
          items: [
            {
              id: 'ManageAllJobs',
              title: 'Manage All Jobs',
              subtitle: 'Platform-wide job database',
              icon: '📋',
              route: 'AdminJobs',
            },
          ],
        },
        {
          title: 'SETTINGS & ACCOUNT',
          items: [
            {
              id: 'AdminProfile',
              title: 'Admin Profile',
              subtitle: 'Admin credentials & settings',
              icon: '⚙️',
              route: 'AdminProfile',
            },
          ],
        },
      ];
    }

    // Candidate default
    return [
      {
        title: 'OVERVIEW & HOME',
        items: [
          {
            id: 'CandidateDashboard',
            title: 'Dashboard',
            subtitle: 'Overview, stats & streak',
            icon: '📊',
            route: 'CandidateDashboard',
          },
        ],
      },
      {
        title: 'RESUME & AI TOOLS',
        items: [
          {
            id: 'ResumeATSAnalyzer',
            title: 'Resume ATS Analyzer',
            subtitle: 'AI score & ATS keyword scan',
            icon: '📑',
            route: 'ResumeATSAnalyzer',
          },
          {
            id: 'LatexResumeBuilder',
            title: 'LaTeX Resume Builder',
            subtitle: 'Templates, editor & PDF preview',
            icon: '📜',
            route: 'LatexResumeBuilder',
          },
          {
            id: 'ResumeHistory',
            title: 'Resume History & Scores',
            subtitle: 'Past uploads & ATS reports',
            icon: '📄',
            route: 'ResumeHistory',
          },
        ],
      },
      {
        title: 'JOBS & CAREER SUITE',
        items: [
          {
            id: 'SearchJobs',
            title: 'Search & Discover Jobs',
            subtitle: 'AI job matching & filters',
            icon: '🔍',
            route: 'SearchJobs',
          },
          {
            id: 'MyApplications',
            title: 'My Applications',
            subtitle: 'Track applied jobs & status',
            icon: '💼',
            route: 'Applications',
          },
        ],
      },
      {
        title: 'ACCOUNT & SETTINGS',
        items: [
          {
            id: 'MyProfile',
            title: 'My Profile & Preferences',
            subtitle: 'Personal info & settings',
            icon: '👤',
            route: 'CandidateProfile',
          },
        ],
      },
    ];
  };

  const sections = getSections();

  // Automatically sync highlighted active menu item when drawer opens
  useEffect(() => {
    if (isDrawerOpen) {
      const currentRouteName = navigation.getCurrentRoute()?.name;
      if (currentRouteName) {
        for (const section of sections) {
          for (const item of section.items) {
            if (
              item.route === currentRouteName ||
              item.id === currentRouteName ||
              item.tab === currentRouteName ||
              item.screen === currentRouteName
            ) {
              setActiveRoute(item.id);
              break;
            }
          }
        }
      }
    }
  }, [isDrawerOpen]);

  if (!isDrawerOpen) {
    return null;
  }

  const handleSelectItem = (item) => {
    try {
      setActiveRoute(item.id);
      closeDrawer();
      if (item.route) {
        navigation.navigate(item.route, item.params || {});
      } else if (item.screen && item.tab) {
        navigation.navigate(item.tab, { screen: item.screen, ...(item.params || {}) });
      } else if (item.tab) {
        navigation.navigate(item.tab, item.params || {});
      } else if (item.screen) {
        navigation.navigate(item.screen, item.params || {});
      }
    } catch (err) {
      console.warn('[Drawer navigate error]:', err);
    }
  };

  const handleSignOut = async () => {
    closeDrawer();
    try {
      await logout();
    } catch (err) {
      console.warn('[SignOut error]:', err);
    }
  };

  return (
    <Modal
      transparent
      visible={isDrawerOpen}
      animationType="none"
      onRequestClose={closeDrawer}
    >
      <View style={styles.modalRoot}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeDrawer}
          />
        </Animated.View>

        {/* Sliding Left Drawer */}
        <Animated.View
          style={[
            styles.drawerContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* ── Top Profile Banner ── */}
            <View style={styles.profileHeader}>
              <View style={styles.profileTopRow}>
                <View
                  style={[
                    styles.avatarCircle,
                    { borderColor: roleAccentColor },
                  ]}
                >
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={closeDrawer}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fullName} numberOfLines={1}>
                {fullName}
              </Text>
              <Text style={styles.emailText} numberOfLines={1}>
                {email}
              </Text>

              <View
                style={[
                  styles.roleBadge,
                  { borderColor: roleAccentColor, backgroundColor: 'rgba(255,255,255,0.04)' },
                ]}
              >
                <Text
                  style={[
                    styles.roleBadgeText,
                    { color: roleAccentColor },
                  ]}
                >
                  {roleBadgeText}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* ── Scrollable Categorized Navigation Sections ── */}
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {sections.map((section, idx) => (
                <View key={idx} style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.items.map((item) => {
                    const isActive = activeRoute === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.menuItem,
                          isActive && styles.menuItemActive,
                        ]}
                        onPress={() => handleSelectItem(item)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.menuIconContainer}>
                          <Text style={styles.menuIcon}>{item.icon}</Text>
                        </View>
                        <View style={styles.menuTextContainer}>
                          <Text
                            style={[
                              styles.menuTitle,
                              isActive && styles.menuTitleActive,
                            ]}
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>
                          {item.subtitle ? (
                            <Text
                              style={styles.menuSubtitle}
                              numberOfLines={1}
                            >
                              {item.subtitle}
                            </Text>
                          ) : null}
                        </View>
                        {isActive ? (
                          <View style={styles.activeIndicatorDot} />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </ScrollView>

            <View style={styles.divider} />

            {/* ── Footer Actions ── */}
            <View style={styles.footerContainer}>
              <View style={styles.serverStatusRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.serverStatusText}>
                  ResumeAI Secure Server — Online
                </Text>
              </View>

              <TouchableOpacity
                style={styles.signOutBtn}
                onPress={handleSignOut}
                activeOpacity={0.8}
              >
                <Text style={styles.signOutIcon}>🚪</Text>
                <Text style={styles.signOutText}>Sign Out of ResumeAI</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 6, 10, 0.78)',
  },
  drawerContainer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#070C14',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 25,
  },
  safeArea: {
    flex: 1,
  },
  profileHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.sm : theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.16)',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeBtnText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '700',
  },
  fullName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#F3F4F6',
    letterSpacing: -0.3,
  },
  emailText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    marginBottom: theme.spacing.sm,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal: theme.spacing.md,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  sectionContainer: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginLeft: theme.spacing.sm,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 2,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  menuItemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.16)',
    borderLeftColor: '#06B6D4',
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F3F4F6',
  },
  menuTitleActive: {
    fontWeight: '800',
    color: '#A78BFA',
  },
  menuSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  activeIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06B6D4',
  },
  footerContainer: {
    padding: theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  serverStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: 4,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  serverStatusText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  signOutIcon: {
    fontSize: 16,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F87171',
  },
});
