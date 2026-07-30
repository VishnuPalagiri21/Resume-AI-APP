import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { candidateApi } from '../../api/candidateApi';
import { getFormDataFile } from '../../utils/fileUtils';

export const ResumeUploadScreen = ({ navigation }) => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick file: ' + err.message);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) {
      setErrorMsg('Please select a PDF resume file');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const formData = new FormData();
      const fileToUpload = await getFormDataFile(file);
      formData.append('resume', fileToUpload);

      if (jobDescription) {
        formData.append('jobDescription', jobDescription);
      }

      const res = await candidateApi.uploadResume(formData);
      if (res.resume) {
        navigation.navigate('ResumeAnalysisResult', { resume: res.resume });
      }
    } catch (err) {
      setErrorMsg(err.message || 'AI Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Header title="AI ATS Analyzer 🤖" subtitle="Scan PDF resume for match score & suggestions" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>1. Select PDF Resume</Text>

        <TouchableOpacity
          style={[styles.uploadBox, file && styles.uploadBoxActive]}
          onPress={handlePickDocument}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 40 }}>📄</Text>
          <Text style={styles.uploadTitle}>
            {file ? file.name : 'Tap to Choose PDF Resume'}
          </Text>
          <Text style={styles.uploadSub}>
            {file ? `${(file.size / 1024).toFixed(1)} KB` : 'PDF format up to 5MB'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: theme.spacing.lg }]}>
          2. Target Job Description (Optional)
        </Text>
        <Text style={styles.helperText}>
          Paste the job requirements to perform instant keyword matching & missing skill analysis.
        </Text>

        <CustomInput
          placeholder="Paste Job Description / required skills here..."
          value={jobDescription}
          onChangeText={setJobDescription}
          multiline
          numberOfLines={6}
        />

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <CustomButton
          title="Run AI ATS Analysis"
          onPress={handleUploadAndAnalyze}
          loading={loading}
          style={{ marginTop: theme.spacing.lg }}
        />

        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => navigation.navigate('ResumeHistory')}
        >
          <Text style={styles.historyText}>📋 View Previously Analyzed Resumes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  helperText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  uploadBox: {
    backgroundColor: theme.colors.cardBg,
    borderColor: theme.colors.cardBorder,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBoxActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  uploadTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginTop: 8,
  },
  uploadSub: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    marginTop: 2,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: theme.colors.danger,
    borderWidth: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
  },
  historyBtn: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  historyText: {
    color: theme.colors.primaryLight,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
});
