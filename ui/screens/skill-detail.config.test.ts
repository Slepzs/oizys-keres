import test from 'node:test';
import assert from 'node:assert/strict';

import { SKILL_IDS } from '../../game/data/skills.data.ts';
import {
  getSkillDetailHref,
  getSkillPrimaryAction,
  getSkillSecondaryAction,
  getSkillSelectionLabel,
  isSkillIdParam,
} from './skill-detail.config.ts';

test('every skill resolves to a dedicated detail route', () => {
  for (const skillId of SKILL_IDS) {
    assert.equal(getSkillDetailHref(skillId), `/skill/${skillId}`);
    assert.equal(isSkillIdParam(skillId), true);
  }

  assert.equal(isSkillIdParam('alchemy'), false);
});

test('crafting uses navigation instead of train/stop for its primary action', () => {
  assert.deepEqual(getSkillPrimaryAction('crafting', false), {
    kind: 'navigate',
    title: 'Open Crafting',
    variant: 'primary',
    href: '/crafting',
  });
});

test('trainable skills toggle their primary action label based on current activity', () => {
  assert.deepEqual(getSkillPrimaryAction('woodcutting', false), {
    kind: 'train',
    title: 'Train',
    variant: 'primary',
  });

  assert.deepEqual(getSkillPrimaryAction('woodcutting', true), {
    kind: 'train',
    title: 'Stop',
    variant: 'secondary',
  });
});

test('combat shortcut is only exposed for support-production skills', () => {
  assert.deepEqual(getSkillSecondaryAction('cooking'), {
    label: 'Combat',
    description: 'Food and potion loadout',
    title: 'Open',
    href: '/combat',
  });

  assert.deepEqual(getSkillSecondaryAction('herblore'), {
    label: 'Combat',
    description: 'Food and potion loadout',
    title: 'Open',
    href: '/combat',
  });

  assert.equal(getSkillSecondaryAction('woodcutting'), null);
});

test('selection labels match the skill-specific selectors shown on the detail screen', () => {
  assert.equal(getSkillSelectionLabel('woodcutting'), 'Tree');
  assert.equal(getSkillSelectionLabel('mining'), 'Rock');
  assert.equal(getSkillSelectionLabel('fishing'), 'Spot');
  assert.equal(getSkillSelectionLabel('cooking'), 'Recipe');
  assert.equal(getSkillSelectionLabel('herblore'), 'Recipe');
  assert.equal(getSkillSelectionLabel('summoning'), 'Companion');
  assert.equal(getSkillSelectionLabel('crafting'), null);
});
