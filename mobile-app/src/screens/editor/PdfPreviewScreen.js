import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { CustomButton } from '../../components/common/CustomButton';
import { getBaseUrl } from '../../api/axios';

export const PdfPreviewScreen = ({ route, navigation }) => {
  const { pdfUrl = '', title = 'Tailored Resume PDF' } = route?.params || {};
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Construct absolute URL (dynamically resolves localhost for Web or 10.0.2.2 / server URL)
  const baseUrl = getBaseUrl();
  const fullPdfUrl = (pdfUrl && pdfUrl.startsWith('http'))
    ? pdfUrl
    : (pdfUrl ? `${baseUrl}${pdfUrl}` : '');

  const getCleanFileName = () => {
    const sanitized = title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    return `${sanitized || 'tailored_resume'}.pdf`;
  };

  const handleDownloadPdf = async () => {
    if (!fullPdfUrl) {
      Alert.alert('Error', 'PDF URL not available. Compile document first.');
      return;
    }

    setDownloading(true);
    setDownloadSuccess(false);

    try {
      if (Platform.OS === 'web') {
        // Web browser direct download
        const link = document.createElement('a');
        link.href = fullPdfUrl;
        link.download = getCleanFileName();
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadSuccess(true);
      } else {
        // Mobile Native (Android / iOS): Download to local file system
        const fileUri = `${FileSystem.documentDirectory}${getCleanFileName()}`;
        const result = await FileSystem.downloadAsync(fullPdfUrl, fileUri);

        if (result.status === 200) {
          setDownloadSuccess(true);
          // Prompt user to save / share / open file
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(result.uri, {
              mimeType: 'application/pdf',
              dialogTitle: `Save ${getCleanFileName()}`,
              UTI: 'com.adobe.pdf',
            });
          } else {
            Alert.alert('Downloaded!', `PDF saved to local storage:\n${result.uri}`);
          }
        } else {
          Alert.alert('Download Failed', 'Could not download PDF file from server.');
        }
      }
    } catch (err) {
      Alert.alert('Download Error', err.message || 'Failed to download PDF file.');
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenBrowser = () => {
    if (!fullPdfUrl) return;
    Linking.openURL(fullPdfUrl).catch(() => {
      Linking.openURL(pdfUrl.startsWith('http') ? pdfUrl : `http://localhost:5000${pdfUrl}`);
    });
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <Header title="Tailored Resume PDF 📄" subtitle={title} showBack onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back to LaTeX Editor</Text>
        </TouchableOpacity>

        {/* PDF Document Preview Card */}
        <View style={styles.previewBox}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 48 }}>📄</Text>
          </View>

          <Text style={styles.previewTitle}>{title}</Text>
          <Text style={styles.pdfStatusBadge}>✨ Compiled & Ready</Text>
          <Text style={styles.pdfPathText} numberOfLines={1}>{pdfUrl || 'pdf-export.pdf'}</Text>

          {downloadSuccess ? (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>✓ Download Initiated / Saved Successfully!</Text>
            </View>
          ) : null}

          <View style={styles.btnGroup}>
            {/* Primary Direct Download Button */}
            <CustomButton
              title={downloading ? 'Downloading PDF…' : '📥 Download Tailored PDF'}
              onPress={handleDownloadPdf}
              loading={downloading}
              style={styles.downloadBtn}
            />

            {/* Browser fallback / External viewer */}
            <CustomButton
              title="🌐 Open in Browser"
              variant="outline"
              onPress={handleOpenBrowser}
              style={styles.secondaryBtn}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  backBtn: {
    marginBottom: theme.spacing.md,
  },
  backText: {
    color: theme.colors.primaryLight,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  previewBox: {
    flex: 1,
    backgroundColor: theme.colors.cardBg,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  previewTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  pdfStatusBadge: {
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
    color: theme.colors.successText,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pdfPathText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  successBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  successText: {
    color: theme.colors.successText,
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
  btnGroup: {
    width: '100%',
    marginTop: theme.spacing.xl,
    gap: 10,
  },
  downloadBtn: {
    width: '100%',
  },
  secondaryBtn: {
    width: '100%',
  },
});
