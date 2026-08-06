import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { candidateApi } from '../../api/candidateApi';

export const ResumeHistoryScreen = ({ navigation }) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const data = await candidateApi.getResumes();
      setResumes(data.resumes || []);
    } catch (err) {
      console.error('[ResumeHistory fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  return (
    <SafeAreaView style={globalStyles.container}>
      <Header title="Resume History 📋" subtitle="All your analyzed PDF documents" />
      <FlatList
        data={resumes}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchResumes} tintColor={theme.colors.primaryLight} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resumeCard}
            onPress={() => navigation.navigate('ResumeAnalysisResult', { resume: item })}
            activeOpacity={0.8}
          >
            <View style={globalStyles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fileName} numberOfLines={1}>📄 {item.fileName}</Text>
                <Text style={styles.date}>
                  {new Date(item.createdAt || Date.now()).toLocaleDateString()} at{' '}
                  {new Date(item.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreText}>{item.atsScore}%</Text>
                <Text style={styles.scoreLabel}>ATS Match</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No resumes analyzed yet.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  resumeCard: {
    backgroundColor: theme.colors.cardBg,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  fileName: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  date: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  scoreBox: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: theme.fontSize.md,
    fontWeight: '900',
    color: theme.colors.primaryLight,
  },
  scoreLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  emptyBox: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
  },
});
