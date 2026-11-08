// AC1-AC5 regression: the same 22 vectors as Assignment #03 test_booking.py, run through the
// backwards-compatible canBook() wrapper over the new checkAvailability().
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canBook } from '../src/domain/availability.js';

const NOW = 540;
const EX = [[600, 660]];
const TWO = [[600, 660], [720, 780]];
const cases = [
  ['AC4 touching end available', 660, 720, NOW, false, EX, true],
  ['AC4 overlap rejected', 630, 690, NOW, false, EX, false],
  ['AC3 blocked room rejected', 660, 720, NOW, true, EX, false],
  ['AC2 exactly 120 allowed', 720, 840, NOW, false, EX, true],
  ['AC2 121 rejected', 720, 841, NOW, false, EX, false],
  ['AC1 starts now rejected', 540, 570, NOW, false, EX, false],
  ['AC1 reversed rejected', 720, 660, NOW, false, EX, false],
  ['AC1 zero length rejected', 700, 700, NOW, false, EX, false],
  ['AC1 end 1440 allowed', 1380, 1440, NOW, false, EX, true],
  ['AC1 end 1441 rejected', 1400, 1441, NOW, false, EX, false],
  ['AC1 negative start rejected', -10, 30, 0, false, [], false],
  ['AC4 between two bookings', 660, 720, NOW, false, TWO, true],
  ['AC4 overlap second booking', 700, 730, NOW, false, TWO, false],
  ['AC4 touch start available', 570, 600, NOW, false, EX, true],
  ['AC4 contains booking', 590, 670, NOW, false, EX, false],
  ['AC4 inside booking', 610, 650, NOW, false, EX, false],
  ['AC4 empty bookings', 600, 660, NOW, false, [], true],
  ['AC1 one minute after now', 541, 600, NOW, false, EX, true],
  ['AC1 start before now', 500, 560, NOW, false, EX, false],
];
for (const [name, s, e, now, blocked, ex, expected] of cases) {
  test(`regression: ${name}`, () => assert.equal(canBook(s, e, now, blocked, ex), expected));
}

test('regression: AC5 returns strict boolean', () => {
  assert.equal(typeof canBook(660, 720, NOW, false, EX), 'boolean');
});

test('regression: AC5 existing bookings not mutated', () => {
  const ex = [[600, 660], [720, 780]];
  const before = JSON.stringify(ex);
  canBook(660, 720, NOW, false, ex);
  canBook(630, 690, NOW, false, ex);
  assert.equal(JSON.stringify(ex), before);
});

test('regression: AC1 non-integer minutes rejected', () => {
  assert.equal(canBook(660.5, 720, NOW, false, EX), false);
  assert.equal(canBook('660', '720', NOW, false, EX), false);
  assert.equal(canBook(true, 60, 0, false, []), false);
});
