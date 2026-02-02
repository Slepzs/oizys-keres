import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeContainer } from '../components/layout/SafeContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useSave } from '@/hooks/useSave';
import { useGame } from '@/hooks/useGame';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { formatTime } from '@/utils/format';

export function SettingsScreen() {
  const { save, reset } = useSave();
  const { state } = useGame();
  const router = useRouter();
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = async () => {
    setSaveStatus('Saving...');
    const success = await save();
    setSaveStatus(success ? 'Saved!' : 'Save failed');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Game',
      'Are you sure you want to reset all progress? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            reset();
            Alert.alert('Game Reset', 'Your progress has been reset.');
          },
        },
      ]
    );
  };

  const sessionTime = Date.now() - state.timestamps.sessionStart;

  return (
    <SafeContainer padTop={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        {/* Save Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Save Game</Text>
          <Text style={styles.sectionDescription}>
            Your game auto-saves every 30 seconds.
          </Text>
          <Button
            title={saveStatus || 'Save Now'}
            onPress={handleSave}
            disabled={!!saveStatus}
          />
        </Card>

        {/* Stats Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Session Stats</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Session Time</Text>
            <Text style={styles.statValue}>{formatTime(sessionTime)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Player Level</Text>
            <Text style={styles.statValue}>{state.player.level}</Text>
          </View>
        </Card>

        {/* Developer Tools Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Developer Tools</Text>
          <Text style={styles.sectionDescription}>
            Admin features for testing and debugging.
          </Text>
          <Button
            title="Open Developer Tools"
            onPress={() => router.push('/settings/admin')}
          />
        </Card>

        {/* Danger Zone */}
        <Card style={{ ...styles.section, ...styles.dangerSection }}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <Text style={styles.sectionDescription}>
            Reset all game progress. This action cannot be undone.
          </Text>
          <Button
            title="Reset Game"
            onPress={handleReset}
            variant="secondary"
          />
        </Card>

        {/* Version Info */}
        <Text style={styles.versionText}>Oizys Keres v1.0.0</Text>
      </ScrollView>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  dangerSection: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  statLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  versionText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
});
