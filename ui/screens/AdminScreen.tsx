import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { SafeContainer } from '../components/layout/SafeContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useGameStore, useGameActions } from '@/store/gameStore';
import { useShallow } from 'zustand/react/shallow';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { ITEM_DEFINITIONS, ITEM_IDS } from '@/game/data/items.data';
import type { ItemId, SkillId, CombatSkillId } from '@/game/types';
import { SKILL_DEFINITIONS, SKILL_IDS } from '@/game/data/skills.data';
import { COMBAT_SKILL_IDS } from '@/game/types/combat';

interface ItemOption {
  id: ItemId;
  name: string;
  icon: string;
  category: string;
}

interface SkillOption {
  id: SkillId;
  name: string;
  icon: string;
}

interface CombatSkillOption {
  id: CombatSkillId;
  name: string;
}

export function AdminScreen() {
  const { addItemToBag, clearBag, setPlayerLevel, setPlayerXp, setSkillLevel, setSkillXp, unlockSkillAutomation, setCombatSkillXp, setPlayerHealth, unlockAllAutomation, maxAllSkills } = useGameActions();

  const { player, skills, combat } = useGameStore(
    useShallow((state) => ({
      player: state.player,
      skills: state.skills,
      combat: state.combat,
    }))
  );

  // Items section state
  const [selectedItemId, setSelectedItemId] = useState<ItemId>('bronze_sword');
  const [itemQuantity, setItemQuantity] = useState('1');

  // Player stats section state
  const [playerLevelInput, setPlayerLevelInput] = useState(String(player.level));
  const [playerXpInput, setPlayerXpInput] = useState(String(player.xp));

  // Skill stats section state
  const [selectedSkillId, setSelectedSkillId] = useState<SkillId>('woodcutting');
  const [skillLevelInput, setSkillLevelInput] = useState('1');
  const [skillXpInput, setSkillXpInput] = useState('0');

  // Combat stats section state
  const [selectedCombatSkillId, setSelectedCombatSkillId] = useState<CombatSkillId>('attack');
  const [combatSkillXpInput, setCombatSkillXpInput] = useState('0');
  const [playerCurrentHpInput, setPlayerCurrentHpInput] = useState(String(combat.playerCurrentHp));
  const [playerMaxHpInput, setPlayerMaxHpInput] = useState(String(combat.playerMaxHp));

  const itemOptions: ItemOption[] = useMemo(() => {
    return ITEM_IDS.map((id) => ({
      id,
      name: ITEM_DEFINITIONS[id].name,
      icon: ITEM_DEFINITIONS[id].icon,
      category: ITEM_DEFINITIONS[id].category,
    }));
  }, []);

  const skillOptions: SkillOption[] = useMemo(() => {
    return SKILL_IDS.map((id) => {
      const skill = SKILL_DEFINITIONS[id];
      return {
        id: skill.id,
        name: skill.name,
        icon: skill.icon,
      };
    });
  }, []);

  const combatSkillOptions: CombatSkillOption[] = useMemo(() => {
    return COMBAT_SKILL_IDS.map((id) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
    }));
  }, []);

  const handleAddItem = () => {
    const quantity = parseInt(itemQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity greater than 0.');
      return;
    }
    const result = addItemToBag(selectedItemId, quantity);
    Alert.alert(
      'Item Added',
      `Added ${result.added} ${ITEM_DEFINITIONS[selectedItemId].name}(s).${result.overflow > 0 ? ` ${result.overflow} items overflowed (bag full).` : ''}`
    );
  };

  const handleClearBag = () => {
    Alert.alert(
      'Clear Bag',
      'Are you sure you want to remove all items from your bag?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearBag();
            Alert.alert('Bag Cleared', 'All items have been removed from your bag.');
          },
        },
      ]
    );
  };

  const handleApplyPlayerStats = () => {
    const level = parseInt(playerLevelInput, 10);
    const xp = parseInt(playerXpInput, 10);

    if (isNaN(level) || level < 1) {
      Alert.alert('Invalid Level', 'Player level must be at least 1.');
      return;
    }
    if (isNaN(xp) || xp < 0) {
      Alert.alert('Invalid XP', 'Player XP must be non-negative.');
      return;
    }

    setPlayerLevel(level);
    setPlayerXp(xp);
    Alert.alert('Player Stats Updated', `Level: ${level}, XP: ${xp}`);
  };

  const handleApplySkillStats = () => {
    const level = parseInt(skillLevelInput, 10);
    const xp = parseInt(skillXpInput, 10);

    if (isNaN(level) || level < 1) {
      Alert.alert('Invalid Level', 'Skill level must be at least 1.');
      return;
    }
    if (isNaN(xp) || xp < 0) {
      Alert.alert('Invalid XP', 'Skill XP must be non-negative.');
      return;
    }

    setSkillLevel(selectedSkillId, level);
    setSkillXp(selectedSkillId, xp);
    Alert.alert('Skill Stats Updated', `${selectedSkillId}: Level ${level}, XP ${xp}`);
  };

  const handleUnlockSkillAutomation = () => {
    unlockSkillAutomation(selectedSkillId);
    Alert.alert('Automation Unlocked', `${selectedSkillId} automation has been unlocked and enabled.`);
  };

  const handleApplyCombatSkillXp = () => {
    const xp = parseInt(combatSkillXpInput, 10);

    if (isNaN(xp) || xp < 0) {
      Alert.alert('Invalid XP', 'Combat skill XP must be non-negative.');
      return;
    }

    setCombatSkillXp(selectedCombatSkillId, xp);
    Alert.alert('Combat Skill Updated', `${selectedCombatSkillId}: XP ${xp}`);
  };

  const handleApplyHealth = () => {
    const current = parseInt(playerCurrentHpInput, 10);
    const max = parseInt(playerMaxHpInput, 10);

    if (isNaN(current) || current < 1) {
      Alert.alert('Invalid Health', 'Current HP must be at least 1.');
      return;
    }
    if (isNaN(max) || max < 1) {
      Alert.alert('Invalid Health', 'Max HP must be at least 1.');
      return;
    }

    setPlayerHealth(current, max);
    Alert.alert('Health Updated', `Current: ${current}, Max: ${max}`);
  };

  const handleUnlockAllAutomation = () => {
    unlockAllAutomation();
    Alert.alert('All Automation Unlocked', 'All skill automation has been unlocked and enabled.');
  };

  const handleMaxAllSkills = () => {
    Alert.alert(
      'Max All Skills',
      'Are you sure you want to set all skills to level 99 with max XP?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Max All',
          style: 'default',
          onPress: () => {
            maxAllSkills();
            Alert.alert('Skills Maxed', 'All skills are now at level 99 with max XP and automation unlocked.');
          },
        },
      ]
    );
  };

  return (
    <SafeContainer padTop={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Developer Tools</Text>

        {/* Items Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          <Text style={styles.sectionDescription}>Add items to your bag or clear it completely.</Text>

          <Text style={styles.label}>Select Item</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemList}>
            {itemOptions.map((item) => (
              <Card
                key={item.id}
                style={selectedItemId === item.id ? { ...styles.itemCard, ...styles.itemCardSelected } : styles.itemCard}
                onPress={() => setSelectedItemId(item.id)}
              >
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <Text style={styles.itemName}>{item.name}</Text>
              </Card>
            ))}
          </ScrollView>

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={itemQuantity}
            onChangeText={setItemQuantity}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor={colors.textMuted}
          />

          <View style={styles.buttonRow}>
            <Button title="Add to Bag" onPress={handleAddItem} style={styles.flexButton} />
            <Button title="Clear Bag" onPress={handleClearBag} variant="secondary" style={styles.flexButton} />
          </View>
        </Card>

        {/* Quick Actions Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionDescription}>One-click developer shortcuts.</Text>

          <View style={styles.buttonRow}>
            <Button title="Unlock All Automation" onPress={handleUnlockAllAutomation} style={styles.flexButton} />
            <Button title="Max All Skills" onPress={handleMaxAllSkills} variant="secondary" style={styles.flexButton} />
          </View>
        </Card>

        {/* Player Stats Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Player Stats</Text>
          <Text style={styles.sectionDescription}>Current: Level {player.level}, XP {player.xp}</Text>

          <Text style={styles.label}>Level</Text>
          <TextInput
            style={styles.input}
            value={playerLevelInput}
            onChangeText={setPlayerLevelInput}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>XP</Text>
          <TextInput
            style={styles.input}
            value={playerXpInput}
            onChangeText={setPlayerXpInput}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
          />

          <Button title="Apply Player Stats" onPress={handleApplyPlayerStats} />
        </Card>

        {/* Skill Stats Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Skill Stats</Text>
          <Text style={styles.sectionDescription}>
            Current: {selectedSkillId} (Level {skills[selectedSkillId]?.level}, XP {skills[selectedSkillId]?.xp})
          </Text>

          <Text style={styles.label}>Select Skill</Text>
          <View style={styles.skillSelector}>
            {skillOptions.map((skill) => (
              <Card
                key={skill.id}
                style={selectedSkillId === skill.id ? { ...styles.skillCard, ...styles.skillCardSelected } : styles.skillCard}
                onPress={() => setSelectedSkillId(skill.id)}
              >
                <Text style={styles.skillIcon}>{skill.icon}</Text>
                <Text style={styles.skillName}>{skill.name}</Text>
              </Card>
            ))}
          </View>

          <Text style={styles.label}>Level</Text>
          <TextInput
            style={styles.input}
            value={skillLevelInput}
            onChangeText={setSkillLevelInput}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>XP</Text>
          <TextInput
            style={styles.input}
            value={skillXpInput}
            onChangeText={setSkillXpInput}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
          />

          <View style={styles.buttonRow}>
            <Button title="Apply Skill Stats" onPress={handleApplySkillStats} style={styles.flexButton} />
            <Button title="Unlock Auto" onPress={handleUnlockSkillAutomation} variant="secondary" style={styles.flexButton} />
          </View>
        </Card>

        {/* Combat Stats Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Combat Stats</Text>
          <Text style={styles.sectionDescription}>Modify combat skills and health.</Text>

          <Text style={styles.label}>Combat Skill</Text>
          <View style={styles.combatSkillSelector}>
            {combatSkillOptions.map((skill) => (
              <Card
                key={skill.id}
                style={selectedCombatSkillId === skill.id ? { ...styles.combatSkillCard, ...styles.combatSkillCardSelected } : styles.combatSkillCard}
                onPress={() => setSelectedCombatSkillId(skill.id)}
              >
                <Text style={styles.combatSkillName}>{skill.name}</Text>
              </Card>
            ))}
          </View>

          <Text style={styles.label}>Combat Skill XP</Text>
          <TextInput
            style={styles.input}
            value={combatSkillXpInput}
            onChangeText={setCombatSkillXpInput}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
          />

          <Button title="Apply Combat XP" onPress={handleApplyCombatSkillXp} />

          <View style={styles.divider} />

          <Text style={styles.label}>Current HP</Text>
          <TextInput
            style={styles.input}
            value={playerCurrentHpInput}
            onChangeText={setPlayerCurrentHpInput}
            keyboardType="number-pad"
            placeholder="10"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Max HP</Text>
          <TextInput
            style={styles.input}
            value={playerMaxHpInput}
            onChangeText={setPlayerMaxHpInput}
            keyboardType="number-pad"
            placeholder="10"
            placeholderTextColor={colors.textMuted}
          />

          <Button title="Apply Health" onPress={handleApplyHealth} />
        </Card>

        <View style={styles.spacer} />
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
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    padding: spacing.sm,
    color: colors.text,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
  itemList: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  itemCard: {
    padding: spacing.sm,
    marginRight: spacing.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  itemCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  itemIcon: {
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
  },
  itemName: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  skillSelector: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  skillCard: {
    flex: 1,
    padding: spacing.sm,
    alignItems: 'center',
  },
  skillCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  skillIcon: {
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
  },
  skillName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  combatSkillSelector: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  combatSkillCard: {
    flex: 1,
    padding: spacing.sm,
    alignItems: 'center',
  },
  combatSkillCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  combatSkillName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceLight,
    marginVertical: spacing.md,
  },
  spacer: {
    height: spacing.xl,
  },
});
