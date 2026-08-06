import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { CustomButton } from '../../components/common/CustomButton';
import { editorApi } from '../../api/editorApi';

export const DocumentListScreen = ({ navigation }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await editorApi.getDocuments();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('[DocumentList fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const confirmDelete = async (docId) => {
    try {
      await editorApi.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => (d._id || d.id) !== docId));
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to delete document');
    }
  };

  const handleDeleteDocument = (item, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const docId = item._id || item.id;
    if (!docId) return;

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
        confirmDelete(docId);
      }
    } else {
      Alert.alert(
        'Delete Resume',
        `Are you sure you want to delete "${item.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(docId) },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <Header title="LaTeX Resume Editor 📝" subtitle="Build & compile tailored LaTeX resumes" />
      <View style={styles.topActions}>
        <CustomButton
          title="+ New Template"
          onPress={() => navigation.navigate('TemplateSelect')}
          style={{ flex: 1 }}
        />
      </View>

      <FlatList
        data={documents}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDocuments} tintColor={theme.colors.primaryLight} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.docCard}
            onPress={() => navigation.navigate('LatexEditor', { docId: item._id || item.id })}
            activeOpacity={0.8}
          >
            <View style={styles.thumbBox}>
              <Text style={{ fontSize: 24 }}>📄</Text>
              {item.compiledPdfUrl ? (
                <View style={styles.compiledBadge}>
                  <Text style={styles.compiledBadgeText}>PDF</Text>
                </View>
              ) : null}
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.docTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.templateTag}>Template: {item.template || 'Modern'}</Text>
              <Text style={styles.updatedAt}>
                Updated {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              {item.compiledPdfUrl ? (
                <TouchableOpacity
                  style={styles.pdfPill}
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('PdfPreview', { pdfUrl: item.compiledPdfUrl, title: item.title });
                  }}
                >
                  <Text style={styles.pdfPillText}>📥 PDF</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.deletePill}
                onPress={(e) => handleDeleteDocument(item, e)}
              >
                <Text style={styles.deleteText}>🗑️ Delete</Text>
              </TouchableOpacity>

              <View style={styles.editPill}>
                <Text style={styles.editText}>Edit →</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No LaTeX documents yet</Text>
              <Text style={styles.emptyDesc}>Choose a template to create your first LaTeX resume!</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topActions: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  list: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  docCard: {
    backgroundColor: theme.colors.cardBg,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  thumbBox: {
    width: 48,
    height: 56,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  compiledBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  compiledBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: theme.colors.successText,
  },
  docTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  templateTag: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primaryLight,
    fontWeight: '700',
    marginTop: 2,
  },
  updatedAt: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  pdfPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  pdfPillText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.successText,
    fontWeight: '800',
  },
  editPill: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  editText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primaryLight,
    fontWeight: '800',
  },
  deletePill: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  deleteText: {
    fontSize: theme.fontSize.xs,
    color: '#F87171',
    fontWeight: '800',
  },
  emptyBox: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
  },
  emptyDesc: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    marginTop: 4,
    textAlign: 'center',
  },
});
