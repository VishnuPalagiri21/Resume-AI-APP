import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { CustomButton } from '../../components/common/CustomButton';
import { CustomInput } from '../../components/common/CustomInput';
import { editorApi } from '../../api/editorApi';

export const DocumentListScreen = ({ navigation }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAiModal, setShowAiModal] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [aiTitle, setAiTitle] = useState('');
  const [generating, setGenerating] = useState(false);

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

  const handleAiGenerate = async () => {
    if (!resumeText) {
      Alert.alert('Required', 'Please enter your current resume details/text.');
      return;
    }

    setGenerating(true);
    try {
      const data = await editorApi.generateAiDocument(resumeText, jobDescription, aiTitle || 'AI Tailored Resume');
      setShowAiModal(false);
      fetchDocuments();
      if (data.document) {
        navigation.navigate('LatexEditor', { docId: data.document._id });
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'AI Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Header title="LaTeX Resume Editor 📝" subtitle="Build & compile tailored LaTeX resumes" />
      <View style={styles.topActions}>
        <CustomButton
          title="+ New from Template"
          onPress={() => navigation.navigate('TemplateSelect')}
          style={{ flex: 1, marginRight: 6 }}
        />
        <CustomButton
          title="✨ AI Tailor"
          variant="secondary"
          onPress={() => setShowAiModal(true)}
          style={{ flex: 1, marginLeft: 6 }}
        />
      </View>

      {showAiModal ? (
        <View style={styles.aiBox}>
          <Text style={styles.aiBoxTitle}>✨ AI Resume Tailoring</Text>
          <CustomInput
            label="Document Title"
            placeholder="e.g. Senior Software Engineer Resume"
            value={aiTitle}
            onChangeText={setAiTitle}
          />
          <CustomInput
            label="Your Experience & Skills"
            placeholder="Paste your key experience, achievements, skills..."
            value={resumeText}
            onChangeText={setResumeText}
            multiline
            numberOfLines={4}
          />
          <CustomInput
            label="Target Job Description (Optional)"
            placeholder="Paste target job requirements..."
            value={jobDescription}
            onChangeText={setJobDescription}
            multiline
            numberOfLines={3}
          />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: theme.spacing.sm }}>
            <CustomButton
              title="Cancel"
              variant="outline"
              onPress={() => setShowAiModal(false)}
              style={{ flex: 1 }}
            />
            <CustomButton
              title="Generate LaTeX"
              onPress={handleAiGenerate}
              loading={generating}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      ) : null}

      <FlatList
        data={documents}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDocuments} tintColor={theme.colors.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={globalStyles.card}
            onPress={() => navigation.navigate('LatexEditor', { docId: item._id })}
            activeOpacity={0.8}
          >
            <View style={globalStyles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.docTitle}>📝 {item.title}</Text>
                <Text style={styles.templateTag}>Template: {item.template}</Text>
                <Text style={styles.updatedAt}>
                  Updated: {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={{ color: theme.colors.primaryLight, fontWeight: 'bold' }}>Edit →</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No LaTeX documents yet</Text>
              <Text style={styles.emptyDesc}>Choose a template or use AI Tailor to create your first LaTeX resume!</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  topActions: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  list: {
    padding: theme.spacing.md,
  },
  docTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  templateTag: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.accent,
    fontWeight: '600',
    marginTop: 2,
  },
  updatedAt: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  aiBox: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
  },
  aiBoxTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.primaryLight,
    marginBottom: theme.spacing.xs,
  },
  emptyBox: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
  emptyDesc: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    marginTop: 4,
    textAlign: 'center',
  },
});
