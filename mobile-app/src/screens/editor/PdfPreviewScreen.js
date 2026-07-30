import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { CustomButton } from '../../components/common/CustomButton';

export const PdfPreviewScreen = ({ route, navigation }) => {
  const { pdfUrl, title } = route.params;

  // Construct absolute URL (using default backend host)
  const fullPdfUrl = pdfUrl.startsWith('http') ? pdfUrl : `http://10.0.2.2:5000${pdfUrl}`;

  const handleOpenBrowser = () => {
    Linking.openURL(fullPdfUrl).catch(() => {
      // Fallback for localhost
      Linking.openURL(pdfUrl.startsWith('http') ? pdfUrl : `http://localhost:5000${pdfUrl}`);
    });
  };

  return (
    <View style={globalStyles.container}>
      <Header title="Compiled PDF Document" subtitle={title} />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back to Editor</Text>
        </TouchableOpacity>

        <View style={styles.previewBox}>
          <Text style={{ fontSize: 64 }}>📄</Text>
          <Text style={styles.previewTitle}>PDF Ready for Viewing</Text>
          <Text style={styles.pdfPathText}>{pdfUrl}</Text>

          <CustomButton
            title="Open / Download PDF in Browser"
            onPress={handleOpenBrowser}
            style={{ marginTop: theme.spacing.lg, width: '100%' }}
          />
        </View>
      </View>
    </View>
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
    fontWeight: '600',
  },
  previewBox: {
    flex: 1,
    backgroundColor: theme.colors.cardBg,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
  },
  pdfPathText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});
