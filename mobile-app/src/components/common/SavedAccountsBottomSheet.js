import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export const SavedAccountsBottomSheet = ({
  visible,
  role = 'candidate',
  accounts = [],
  onSelectAccount,
  onRemoveAccount,
  onClose,
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 12,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getPortalLabel = () => {
    const r = (role || 'candidate').toLowerCase();
    if (r === 'recruiter') return 'Recruiter Portal';
    if (r === 'admin') return 'Admin Portal';
    return 'Candidate Portal';
  };

  const renderAccount = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={[styles.accountRow, index === accounts.length - 1 && styles.lastRow]}
        onPress={() => onSelectAccount(item)}
        activeOpacity={0.75}
      >
        <View style={styles.accountInfo}>
          <Text style={styles.accountEmail} numberOfLines={1}>{item.email}</Text>
          <Text style={styles.accountDots}>•••••••••</Text>
        </View>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => onRemoveAccount(item.email)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.removeIcon}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Handle bar */}
        <View style={styles.handle} />

        {/* Header - Styled like Chrome/Edge Saved passwords */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved passwords</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Top separator */}
        <View style={styles.separator} />

        {/* Accounts list */}
        {accounts.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>No saved accounts for this portal.</Text>
          </View>
        ) : (
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.email}
            renderItem={renderAccount}
            scrollEnabled={accounts.length > 4}
            style={{ maxHeight: 260 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Bottom separator */}
        <View style={styles.separator} />

        {/* Footer - Manage passwords with Key icon */}
        <View style={styles.footer}>
          <Text style={styles.keyIcon}>🔑</Text>
          <Text style={styles.footerText}>
            Manage passwords ({getPortalLabel()})
          </Text>
        </View>

        {/* Safe area padding */}
        <View style={{ height: Platform.OS === 'ios' ? 24 : 12 }} />
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeBtn: {
    padding: 4,
  },
  closeIcon: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  accountInfo: {
    flex: 1,
    marginRight: 12,
  },
  accountEmail: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  accountDots: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 3,
    letterSpacing: 2,
  },
  removeBtn: {
    padding: 6,
  },
  removeIcon: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyRow: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  keyIcon: {
    fontSize: 16,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
});