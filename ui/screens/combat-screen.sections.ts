export type CombatScreenViewId = 'combat-profile' | 'hunt-setup' | 'battle-feed';

interface NextCombatScreenViewOptions {
  currentView: CombatScreenViewId;
  hadActiveCombat: boolean;
  hasActiveCombat: boolean;
}

const COMBAT_SCREEN_VIEWS: CombatScreenViewId[] = [
  'combat-profile',
  'hunt-setup',
  'battle-feed',
];

export function getCombatScreenViews(): CombatScreenViewId[] {
  return COMBAT_SCREEN_VIEWS;
}

export function getNextCombatScreenView({
  currentView,
  hadActiveCombat,
  hasActiveCombat,
}: NextCombatScreenViewOptions): CombatScreenViewId {
  if (!hadActiveCombat && hasActiveCombat) {
    return 'battle-feed';
  }

  return currentView;
}
