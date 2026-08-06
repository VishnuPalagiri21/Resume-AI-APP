import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { CustomButton } from '../../components/common/CustomButton';
import { editorApi } from '../../api/editorApi';

export const LatexEditorScreen = ({ route, navigation }) => {
  const docId = route?.params?.docId;

  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('');
  const [latexSource, setLatexSource] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [compiledPdfUrl, setCompiledPdfUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [compilationError, setCompilationError] = useState('');

  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      try {
        let activeDocId = docId;
        if (!activeDocId) {
          const docsRes = await editorApi.getDocuments();
          if (docsRes.documents && docsRes.documents.length > 0) {
            const first = docsRes.documents[0];
            setDocument(first);
            setTitle(first.title || 'My Resume');
            setLatexSource(first.latexSource || '');
            setIsPublic(!!first.isPublic);
            setCompiledPdfUrl(first.compiledPdfUrl || '');
            setLoading(false);
            return;
          } else {
            const createdRes = await editorApi.createDocument('My Resume', 'modern');
            if (createdRes.document) {
              setDocument(createdRes.document);
              setTitle(createdRes.document.title || 'My Resume');
              setLatexSource(createdRes.document.latexSource || '');
              setIsPublic(!!createdRes.document.isPublic);
              setCompiledPdfUrl(createdRes.document.compiledPdfUrl || '');
              setLoading(false);
              return;
            }
          }
        }

        if (activeDocId) {
          const data = await editorApi.getDocumentById(activeDocId);
          if (data.document) {
            setDocument(data.document);
            setTitle(data.document.title || '');
            setLatexSource(data.document.latexSource || '');
            setIsPublic(!!data.document.isPublic);
            setCompiledPdfUrl(data.document.compiledPdfUrl || '');
          }
        }
      } catch (err) {
        Alert.alert('Notice', err.message || 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [docId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await editorApi.updateDocument(docId, { title, latexSource });
      Alert.alert('Success', 'Document saved!');
      if (data.document) {
        setDocument(data.document);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleCompile = async () => {
    setCompilationError('');
    setCompiling(true);
    try {
      await editorApi.updateDocument(docId, { title, latexSource });
      const res = await editorApi.compileDocument(docId, latexSource);

      if (res.pdfUrl) {
        setCompiledPdfUrl(res.pdfUrl);
        Alert.alert('Compilation Successful! 🎉', res.message || 'PDF compiled successfully!', [
          {
            text: 'Preview PDF',
            onPress: () => navigation.navigate('PdfPreview', { pdfUrl: res.pdfUrl, title }),
          },
          { text: 'OK' },
        ]);
      }
    } catch (err) {
      setCompilationError(err.message || 'LaTeX compilation failed');
    } finally {
      setCompiling(false);
    }
  };

  const handleSaveSnapshot = async () => {
    Alert.prompt(
      'Save Snapshot',
      'Enter a name/label for this snapshot version:',
      async (label) => {
        if (!label) return;
        try {
          await editorApi.saveVersion(docId, label);
          Alert.alert('Success', 'Snapshot version saved!');
        } catch (err) {
          Alert.alert('Error', err.message || 'Failed to save snapshot');
        }
      }
    );
  };

  const handleToggleShare = async () => {
    try {
      const newStatus = !isPublic;
      const res = await editorApi.toggleShare(docId, newStatus);
      setIsPublic(newStatus);
      Alert.alert('Sharing Status', res.message || 'Sharing updated');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to toggle share');
    }
  };

  const confirmDelete = async () => {
    const targetId = docId || document?._id || document?.id;
    if (!targetId) return;
    try {
      await editorApi.deleteDocument(targetId);
      Alert.alert('Deleted', 'Document deleted.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to delete document');
    }
  };

  const handleDelete = () => {
    const targetId = docId || document?._id || document?.id;
    if (!targetId) return;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Are you sure you want to delete "${title}"?`)) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Delete Resume',
        `Are you sure you want to delete "${title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmDelete },
        ]
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primaryLight} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <Header title={title || 'LaTeX Editor'} subtitle="Edit source & compile to PDF" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back to Document List</Text>
        </TouchableOpacity>

        {/* Action Toolbar — matches web editor-toolbar */}
        <View style={styles.toolbar}>
          <CustomButton
            title="💾 Save"
            onPress={handleSave}
            loading={saving}
            style={{ flex: 1, marginRight: 4 }}
          />
          <CustomButton
            title="⚡ Compile PDF"
            variant="secondary"
            onPress={handleCompile}
            loading={compiling}
            style={{ flex: 1, marginHorizontal: 4 }}
          />
          {compiledPdfUrl ? (
            <CustomButton
              title="📥 Download PDF"
              variant="outline"
              onPress={() => navigation.navigate('PdfPreview', { pdfUrl: compiledPdfUrl, title })}
              style={{ flex: 1, marginLeft: 4 }}
            />
          ) : null}
        </View>

        <View style={styles.secondaryToolbar}>
          <TouchableOpacity style={styles.toolBtn} onPress={handleSaveSnapshot}>
            <Text style={styles.toolBtnText}>📸 Snapshot</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={handleToggleShare}>
            <Text style={styles.toolBtnText}>
              {isPublic ? '🌐 Public' : '🔒 Private'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toolBtn, { borderColor: 'rgba(239, 68, 68, 0.35)', backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}
            onPress={handleDelete}
          >
            <Text style={[styles.toolBtnText, { color: '#F87171' }]}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>

        {compilationError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>LaTeX Compilation Error:</Text>
            <Text style={styles.errorText}>{compilationError}</Text>
          </View>
        ) : null}

        {/* Code Editor */}
        <Text style={globalStyles.sectionHeading}>LaTeX Source Code</Text>
        <TextInput
          style={styles.codeEditor}
          value={latexSource}
          onChangeText={setLatexSource}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          fontFamily={Platform.OS === 'ios' ? 'Courier' : 'monospace'}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  backBtn: {
    marginBottom: theme.spacing.sm,
  },
  backText: {
    color: theme.colors.primaryLight,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  toolbar: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  secondaryToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    gap: 8,
  },
  toolBtn: {
    flex: 1,
    backgroundColor: theme.colors.cardBg,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toolBtnText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  errorTitle: {
    color: theme.colors.dangerText,
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
  },
  errorText: {
    color: theme.colors.dangerText,
    fontSize: theme.fontSize.xs,
    marginTop: 4,
  },
  codeEditor: {
    backgroundColor: '#060B12',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: 13,
    color: '#E2E8F0',
    minHeight: 420,
    textAlignVertical: 'top',
    ...theme.shadows.sm,
  },
});
