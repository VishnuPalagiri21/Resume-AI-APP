import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { CustomButton } from '../../components/common/CustomButton';
import { editorApi } from '../../api/editorApi';

export const LatexEditorScreen = ({ route, navigation }) => {
  const { docId } = route.params;

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
      try {
        const data = await editorApi.getDocumentById(docId);
        if (data.document) {
          setDocument(data.document);
          setTitle(data.document.title || '');
          setLatexSource(data.document.latexSource || '');
          setIsPublic(!!data.document.isPublic);
          setCompiledPdfUrl(data.document.compiledPdfUrl || '');
        }
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to load document');
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
      // First auto-save current LaTeX source
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

  if (loading) {
    return (
      <View style={[globalStyles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Header title={title || 'LaTeX Editor'} subtitle="Edit source & compile to PDF" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back to Document List</Text>
        </TouchableOpacity>

        {/* Action Toolbar */}
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
              title="👁️ View PDF"
              variant="outline"
              onPress={() => navigation.navigate('PdfPreview', { pdfUrl: compiledPdfUrl, title })}
              style={{ flex: 1, marginLeft: 4 }}
            />
          ) : null}
        </View>

        <View style={styles.secondaryToolbar}>
          <TouchableOpacity style={styles.toolBtn} onPress={handleSaveSnapshot}>
            <Text style={styles.toolBtnText}>📸 Save Snapshot</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={handleToggleShare}>
            <Text style={styles.toolBtnText}>
              {isPublic ? '🌐 Public (Tap to make Private)' : '🔒 Private (Tap to Share)'}
            </Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: theme.spacing.md,
  },
  backBtn: {
    marginBottom: theme.spacing.sm,
  },
  backText: {
    color: theme.colors.primaryLight,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
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
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 8,
    alignItems: 'center',
  },
  toolBtnText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: theme.colors.danger,
    borderWidth: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  errorTitle: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.xs,
    marginTop: 2,
  },
  codeEditor: {
    backgroundColor: '#0a0f1d',
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 13,
    color: '#e2e8f0',
    minHeight: 400,
    textAlignVertical: 'top',
  },
});
