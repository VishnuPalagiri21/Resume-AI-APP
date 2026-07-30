import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { candidateApi } from '../../api/candidateApi';
import { useAuth } from '../../context/AuthContext';
import { getFormDataFile } from '../../utils/fileUtils';

export const ApplyJobModalScreen = ({ route, navigation }) => {
  const { jobId, jobTitle } = route.params;
  const { user } = useAuth();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [pickedFile, setPickedFile] = useState(null);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [coverNote, setCoverNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchUserResumes = async () => {
      try {
        const data = await candidateApi.getResumes();
        setResumes(data.resumes || []);
      } catch (err) {
        console.error('[Fetch user resumes error]', err);
      }
    };
    fetchUserResumes();
  }, []);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPickedFile(result.assets[0]);
        setSelectedResumeId('');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document: ' + err.message);
    }
  };

  const handleSubmitApplication = async () => {
    if (!pickedFile && !selectedResumeId) {
      setErrorMsg('Please upload a PDF resume or select an existing resume');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('coverNote', coverNote);
      formData.append('fullName', fullName);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('location', location);
      formData.append('experienceYears', experienceYears);
      formData.append('noticePeriod', noticePeriod);
      formData.append('portfolioUrl', portfolioUrl);

      if (pickedFile) {
        const fileToUpload = await getFormDataFile(pickedFile);
        formData.append('resumeFile', fileToUpload);
      } else if (selectedResumeId) {
        formData.append('resumeId', selectedResumeId);
      }

      const res = await candidateApi.applyForJob(jobId, formData);

      Alert.alert(
        'Application Status',
        res.message || 'Application submitted successfully!',
        [
          {
            text: 'View Applications',
            onPress: () => {
              navigation.navigate('ApplicationsTab');
            },
          },
        ]
      );
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Header title="Apply for Job" subtitle={jobTitle} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Cancel & Back</Text>
        </TouchableOpacity>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Section 1: Resume Upload / Picker */}
        <Text style={globalStyles.sectionHeading}>1. Resume Attachment</Text>
        <TouchableOpacity
          style={[styles.uploadBox, pickedFile && styles.uploadBoxActive]}
          onPress={handlePickDocument}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 32 }}>📄</Text>
          <Text style={styles.uploadTitle}>
            {pickedFile ? pickedFile.name : 'Tap to Upload PDF Resume'}
          </Text>
          <Text style={styles.uploadSub}>
            {pickedFile ? `${(pickedFile.size / 1024).toFixed(1)} KB` : 'Max 5MB • PDF Only'}
          </Text>
        </TouchableOpacity>

        {resumes.length > 0 ? (
          <View style={{ marginTop: theme.spacing.sm }}>
            <Text style={styles.orText}>— OR Select from Saved Resumes —</Text>
            {resumes.map((r) => (
              <TouchableOpacity
                key={r._id}
                style={[
                  styles.resumeOption,
                  selectedResumeId === r._id && styles.resumeOptionSelected,
                ]}
                onPress={() => {
                  setSelectedResumeId(r._id);
                  setPickedFile(null);
                }}
              >
                <Text
                  style={[
                    styles.resumeOptionName,
                    selectedResumeId === r._id && { color: theme.colors.primaryLight },
                  ]}
                >
                  {r.fileName}
                </Text>
                <Text style={styles.resumeOptionScore}>ATS Score: {r.atsScore}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Section 2: Screening Info */}
        <Text style={[globalStyles.sectionHeading, { marginTop: theme.spacing.lg }]}>
          2. Screening Information
        </Text>

        <CustomInput label="Full Name" value={fullName} onChangeText={setFullName} />
        <CustomInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <CustomInput label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <CustomInput label="Location / City" placeholder="e.g. San Francisco, CA" value={location} onChangeText={setLocation} />
        <CustomInput label="Total Experience (Years)" placeholder="e.g. 4 years" value={experienceYears} onChangeText={setExperienceYears} />
        <CustomInput label="Notice Period / Availability" placeholder="e.g. Immediate / 30 days" value={noticePeriod} onChangeText={setNoticePeriod} />
        <CustomInput label="Portfolio / GitHub Link" placeholder="https://..." value={portfolioUrl} onChangeText={setPortfolioUrl} />

        {/* Section 3: Cover Note */}
        <Text style={[globalStyles.sectionHeading, { marginTop: theme.spacing.lg }]}>
          3. Cover Note / Message
        </Text>
        <CustomInput
          placeholder="Introduce yourself and explain why you're a great fit..."
          value={coverNote}
          onChangeText={setCoverNote}
          multiline
          numberOfLines={4}
        />

        <CustomButton
          title="Submit Application"
          onPress={handleSubmitApplication}
          loading={loading}
          style={{ marginVertical: theme.spacing.xl }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: theme.spacing.md,
  },
  backBtn: {
    marginBottom: theme.spacing.md,
  },
  backText: {
    color: theme.colors.primaryLight,
    fontSize: theme.fontSize.sm,
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
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
  },
  uploadBox: {
    backgroundColor: theme.colors.cardBg,
    borderColor: theme.colors.cardBorder,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBoxActive: {
    borderColor: theme.colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
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
  orText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    textAlign: 'center',
    marginVertical: theme.spacing.sm,
  },
  resumeOption: {
    backgroundColor: theme.colors.cardBg,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resumeOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  resumeOptionName: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  resumeOptionScore: {
    color: theme.colors.success,
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
  },
});
