import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { editorApi } from '../../api/editorApi';

export const TemplateSelectScreen = ({ navigation }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedKey, setSelectedKey] = useState('modern');
  const [title, setTitle] = useState('My Resume');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTpls = async () => {
      try {
        const data = await editorApi.getTemplates();
        setTemplates(data.templates || []);
      } catch (err) {
        console.error('[Templates fetch error]', err);
      }
    };
    fetchTpls();
  }, []);

  const handleCreate = async () => {
    if (!title) {
      Alert.alert('Required', 'Please enter a document title.');
      return;
    }
    setLoading(true);
    try {
      const data = await editorApi.createDocument(title, selectedKey);
      const targetDocId = data.document?._id || data.document?.id;
      if (targetDocId) {
        navigation.navigate('LatexEditor', { docId: targetDocId });
      } else {
        Alert.alert('Notice', 'Document created successfully');
        navigation.navigate('DocumentListMain');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <Header title="Choose LaTeX Template" subtitle="Select a design style for your resume" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <CustomInput
          label="Resume Title"
          placeholder="e.g. Software Engineer Resume 2026"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={[globalStyles.sectionHeading, { marginTop: theme.spacing.md }]}>
          Available Templates
        </Text>

        {templates.map((tpl) => (
          <TouchableOpacity
            key={tpl.key}
            style={[
              styles.tplCard,
              selectedKey === tpl.key && styles.tplCardSelected,
            ]}
            onPress={() => setSelectedKey(tpl.key)}
            activeOpacity={0.8}
          >
            <View style={globalStyles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.iconBox, selectedKey === tpl.key && styles.iconBoxSelected]}>
                  <Text style={{ fontSize: 22 }}>{tpl.icon}</Text>
                </View>
                <View>
                  <Text style={styles.tplName}>{tpl.label}</Text>
                  {tpl.badge ? (
                    <View style={styles.badgePill}>
                      <Text style={styles.badgeText}>{tpl.badge}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <Text
                style={[
                  styles.radio,
                  selectedKey === tpl.key && styles.radioSelected,
                ]}
              >
                {selectedKey === tpl.key ? '●' : '○'}
              </Text>
            </View>
            <Text style={styles.tplDesc}>{tpl.description}</Text>
          </TouchableOpacity>
        ))}

        <CustomButton
          title="Create LaTeX Document"
          onPress={handleCreate}
          loading={loading}
          style={{ marginVertical: theme.spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  backBtn: {
    marginBottom: theme.spacing.md,
  },
  backText: {
    color: theme.colors.primaryLight,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  tplCard: {
    backgroundColor: theme.colors.cardBg,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  tplCardSelected: {
    borderColor: 'rgba(139, 92, 246, 0.4)',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    ...theme.shadows.glow,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconBoxSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  tplName: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  badgePill: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: 'rgba(139, 92, 246, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 9,
    color: theme.colors.primaryLight,
    fontWeight: '800',
  },
  tplDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    lineHeight: 18,
  },
  radio: {
    fontSize: 22,
    color: theme.colors.textMuted,
  },
  radioSelected: {
    color: theme.colors.primaryLight,
  },
});
