import { ENEMY_DEFINITIONS } from '@/game/data';
import { scaleEnemyMaxHp } from '@/game/logic/combat/balance';

const DEFAULT_ACTION_SLOTS = [
  { id: 'slash', label: 'Slash', tone: 'attack' },
  { id: 'burst', label: 'Burst', tone: 'attack' },
  { id: 'guard', label: 'Guard', tone: 'defense' },
  { id: 'potion', label: 'Potion', tone: 'support' },
] as const;

type ActionSlotTone = (typeof DEFAULT_ACTION_SLOTS)[number]['tone'];
type TelegraphState = 'idle' | 'charging' | 'imminent';

interface BattleSceneActiveCombat {
  zoneId: string;
  enemyId: string;
  enemyCurrentHp: number;
  playerCurrentHp: number;
  playerMaxHp: number;
  playerNextAttackAt: number;
  enemyNextAttackAt: number;
  petNextAttackAt: number | null;
}

interface BuildBattleSceneModelOptions {
  activeCombat: BattleSceneActiveCombat | null;
  totalKills: number;
  totalDeaths: number;
  playerAttackIntervalSeconds: number;
  enemyAttackIntervalSeconds: number | null;
  now: number;
}

interface BattleSceneHpModel {
  current: number;
  max: number;
  progress: number;
}

interface BattleSceneActionSlot {
  id: string;
  label: string;
  tone: ActionSlotTone;
}

interface BattleSceneIdleModel {
  state: 'idle';
  idleTitle: string;
  idleBody: string;
  summary: {
    totalKills: number;
    totalDeaths: number;
  };
  actionSlots: BattleSceneActionSlot[];
}

interface BattleSceneActiveModel {
  state: 'active';
  summary: {
    totalKills: number;
    totalDeaths: number;
    kdRatio: string;
    playerAttackIntervalSeconds: number;
    enemyAttackIntervalSeconds: number | null;
  };
  player: {
    label: string;
    hp: BattleSceneHpModel;
    nextAttackAt: number;
    petNextAttackAt: number | null;
  };
  enemy: {
    id: string;
    name: string;
    icon: string;
    hp: BattleSceneHpModel;
    nextAttackAt: number;
    telegraphState: TelegraphState;
  };
  actionSlots: BattleSceneActionSlot[];
  bossPrompt: null;
}

export type BattleSceneModel = BattleSceneIdleModel | BattleSceneActiveModel;

function clampProgress(current: number, max: number) {
  if (max <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(1, current / max));
}

function getTelegraphState(nextAttackAt: number, now: number) {
  const remainingMs = nextAttackAt - now;

  if (remainingMs <= 0) {
    return 'imminent' satisfies TelegraphState;
  }

  if (remainingMs <= 150) {
    return 'imminent' satisfies TelegraphState;
  }

  return 'charging' satisfies TelegraphState;
}

export function buildBattleSceneModel({
  activeCombat,
  totalKills,
  totalDeaths,
  playerAttackIntervalSeconds,
  enemyAttackIntervalSeconds,
  now,
}: BuildBattleSceneModelOptions): BattleSceneModel {
  const actionSlots = [...DEFAULT_ACTION_SLOTS];

  if (!activeCombat) {
    return {
      state: 'idle',
      idleTitle: 'Awaiting Encounter',
      idleBody: 'Start a hunt from setup and the battle lane will populate here.',
      summary: {
        totalKills,
        totalDeaths,
      },
      actionSlots,
    };
  }

  const enemy = ENEMY_DEFINITIONS[activeCombat.enemyId];
  const enemyMaxHp = enemy ? scaleEnemyMaxHp(enemy.maxHp) : activeCombat.enemyCurrentHp;

  return {
    state: 'active',
    summary: {
      totalKills,
      totalDeaths,
      kdRatio: totalKills <= 0 ? '0.0' : (totalKills / Math.max(1, totalDeaths)).toFixed(1),
      playerAttackIntervalSeconds,
      enemyAttackIntervalSeconds,
    },
    player: {
      label: 'Player',
      hp: {
        current: activeCombat.playerCurrentHp,
        max: activeCombat.playerMaxHp,
        progress: clampProgress(activeCombat.playerCurrentHp, activeCombat.playerMaxHp),
      },
      nextAttackAt: activeCombat.playerNextAttackAt,
      petNextAttackAt: activeCombat.petNextAttackAt,
    },
    enemy: {
      id: activeCombat.enemyId,
      name: enemy?.name ?? activeCombat.enemyId,
      icon: enemy?.icon ?? '□',
      hp: {
        current: activeCombat.enemyCurrentHp,
        max: enemyMaxHp,
        progress: clampProgress(activeCombat.enemyCurrentHp, enemyMaxHp),
      },
      nextAttackAt: activeCombat.enemyNextAttackAt,
      telegraphState: getTelegraphState(activeCombat.enemyNextAttackAt, now),
    },
    actionSlots,
    bossPrompt: null,
  };
}
