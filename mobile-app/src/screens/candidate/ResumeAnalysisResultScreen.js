import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { Header } from '../../components/common/Header';
import { AtsScoreGauge } from '../../components/candidate/AtsScoreGauge';
import { SkillTag } from '../../components/candidate/SkillTag';
import { CustomButton } from '../../components/common/CustomButton';

export const ResumeAnalysisResultScreen = ({ route, navigation }) => {
  const { resume } = route.params;

  return (
    <View style={globalStyles.container}>
      <Header title="ATS Analysis Results 📊" subtitle={resume.fileName} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back to Upload</Text>
        </TouchableOpacity>

        {/* Score Gauge */}
        <View style={globalStyles.card}>
          <AtsScoreGauge score={resume.atsScore ?? 0} />
          <Text style={styles.fileName}>File: {resume.fileName}</Text>
          <Text style={styles.dateText}>
            Analyzed: {new Date(resume.createdAt || Date.now()).toLocaleDateString()}
          </Text>
        </View>

        {/* Matched Skills */}
        <Text style={globalStyles.sectionHeading}>
          Matched Skills ({resume.matchedSkills?.length || 0})
        </Text>
        <View style={styles.skillsBox}>
          {resume.matchedSkills && resume.matchedSkills.length > 0 ? (
            resume.matchedSkills.map((s, idx) => <SkillTag key={idx} name={s} variant="matched" />)
          ) : (
            <Text style={{ color: theme.colors.textMuted }}>No matched skills detected.</Text>
          )}
        </View>

        {/* Missing Skills */}
        <Text style={globalStyles.sectionHeading}>
          Missing / Recommended Skills ({resume.missingSkills?.length || 0})
        </Text>
        <View style={styles.skillsBox}>
          {resume.missingSkills && resume.missingSkills.length > 0 ? (
            resume.missingSkills.map((s, idx) => <SkillTag key={idx} name={s} variant="missing" />)
          ) : (
            <Text style={{ color: theme.colors.textMuted }}>No missing skills detected! Great match!</Text>
          )}
        </View>

        {/* AI Suggestions */}
        <Text style={globalStyles.sectionHeading}>AI Recommendations</Text>
        <View style={globalStyles.card}>
          {resume.suggestions && resume.suggestions.length > 0 ? (
            resume.suggestions.map((item, idx) => (
              <View key={idx} style={styles.suggestionItem}>
                <Text style={styles.suggestionBullet}>💡</Text>
                <Text style={styles.suggestionText}>{item}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: theme.colors.textMuted }}>No additional suggestions.</Text>
          )}
        </View>

        {/* Tailor Resume Action */}
        <CustomButton
          title="Tailor in LaTeX Editor"
          onPress={() => navigation.navigate('LatexEditorTab')}
          style={{ marginVertical: theme.spacing.md }}
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
    marginBottom: theme.spacing.sm,
  },
  backText: {
    color: theme.colors.primaryLight,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  fileName: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  dateText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  skillsBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  suggestionBullet: {
    marginRight: 8,
    fontSize: 16,
  },
  suggestionText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
});
