import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getSafeContainerMetrics,
  PLAYER_HEADER_BAR_MIN_HEIGHT,
} from './SafeContainer.metrics.ts';

test('reserves safe top space for the fixed player header', () => {
  const metrics = getSafeContainerMetrics({
    insetsTop: 47,
    insetsBottom: 34,
    showPlayerHeader: true,
  });

  assert.equal(metrics.headerTop, 47);
  assert.equal(metrics.contentPaddingTop, 151);
  assert.equal(metrics.contentPaddingBottom, 50);
  assert.equal(PLAYER_HEADER_BAR_MIN_HEIGHT, 88);
});

test('uses normal safe area padding when no fixed player header is shown', () => {
  const metrics = getSafeContainerMetrics({
    insetsTop: 47,
    insetsBottom: 34,
  });

  assert.equal(metrics.headerTop, 47);
  assert.equal(metrics.contentPaddingTop, 63);
  assert.equal(metrics.contentPaddingBottom, 50);
});
