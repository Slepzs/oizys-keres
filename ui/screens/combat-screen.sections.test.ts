import test from 'node:test';
import assert from 'node:assert/strict';

import * as combatScreenSections from './combat-screen.sections.ts';

test('orders combat sub screens as profile, hunt, then battle', () => {
  const sections = combatScreenSections.getCombatScreenViews();

  assert.deepEqual(sections, ['combat-profile', 'hunt-setup', 'battle-feed']);
});

test('auto switches to battle when combat starts from another sub screen', () => {
  const nextView = combatScreenSections.getNextCombatScreenView({
    currentView: 'combat-profile',
    hadActiveCombat: false,
    hasActiveCombat: true,
  });

  assert.equal(nextView, 'battle-feed');
});

test('does not lock navigation once combat is already active', () => {
  const nextView = combatScreenSections.getNextCombatScreenView({
    currentView: 'hunt-setup',
    hadActiveCombat: true,
    hasActiveCombat: true,
  });

  assert.equal(nextView, 'hunt-setup');
});
