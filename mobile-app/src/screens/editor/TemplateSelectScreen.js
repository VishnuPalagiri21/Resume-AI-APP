import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
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
      if (data.document) {
        navigation.navigate('LatexEditor', { docId: data.document._id });
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
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
                <Text style={{ fontSize: 28, marginRight: 10 }}>{tpl.icon}</Text>
                <View>
                  <Text style={styles.tplName}>{tpl.label}</Text>
                  {tpl.badge ? (
                    <Text style={styles.badge}>{tpl.badge}</Text>
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
  tplCard: {
    backgroundColor: theme.colors.cardBg,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  tplCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  tplName: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  badge: {
    fontSize: 10,
    color: theme.colors.primaryLight,
    fontWeight: 'bold',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  tplDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  radio: {
    fontSize: 22,
    color: theme.colors.textMuted,
  },
  radioSelected: {
    color: theme.colors.primary,
  },
});
