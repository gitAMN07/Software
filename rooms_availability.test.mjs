// Room catalog + availability against the CHOSEN room (AC1-AC6 per room, F3).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROOMS, NOW, findRoom } from '../src/data/rooms.js';
import { checkAvailability } from '../src/domain/availability.js';
import { parseHHMM } from '../src/domain/time.js';

const room = (id) => findRoom(ROOMS, id);
const check = (id, start, end) => checkAvailability({ start, end, now: NOW, room: room(id) });

test('catalog: at least four rooms with id, name, capacity, equipment, blocked, bookings', () => {
  assert.ok(ROOMS.length >= 4);
  for (const r of ROOMS) {
    assert.equal(typeof r.id, 'string');
    assert.equal(typeof r.name, 'string');
    assert.ok(Number.isInteger(r.capacity));
    assert.ok(Array.isArray(r.equipment));
    assert.equal(typeof r.blocked, 'boolean');
    assert.ok(Array.isArray(r.bookings));
  }
});

test('catalog: data is immutable (AC5)', () => {
  assert.throws(() => { ROOMS[0].bookings.push({ start: 0, end: 10 }); }, TypeError);
  assert.throws(() => { ROOMS[0].blocked = true; }, TypeError);
});

test('uses the chosen room bookings, not another room (11:00-12:00)', () => {
  // A-101 has 10:00-11:00 -> touching -> available; C-305 has 11:00-12:00 -> overlap.
  assert.equal(check('A-101', 660, 720).available, true);
  const c = check('C-305', 660, 720);
  assert.equal(c.available, false);
  assert.deepEqual(c.reasons.map((r) => r.code), ['OVERLAP']);
});

test('boundary: exactly 120 min available, 121 min rejected', () => {
  assert.equal(check('A-101', 720, 840).available, true);
  const r = check('A-101', 720, 841);
  assert.equal(r.available, false);
  assert.deepEqual(r.reasons.map((x) => x.code), ['TOO_LONG']);
});

test('boundary: touching interval available, overlapping by 1 minute rejected', () => {
  assert.equal(check('B-204', 720, 780).available, true); // between 10:00-12:00 and 13:00-14:00
  assert.equal(check('B-204', 719, 780).available, false);
  assert.equal(check('B-204', 720, 781).available, false);
});

test('F3: blocked room is never reported available, even for a free slot', () => {
  const r = check('D-110', 900, 960);
  assert.equal(r.available, false);
  assert.deepEqual(r.reasons.map((x) => x.code), ['BLOCKED']);
});

test('AC6: every rejection carries a readable reason; multiple reasons are all listed', () => {
  const r = check('B-204', 540, 700); // starts now, 160 min, overlaps 10:00-12:00
  assert.deepEqual(r.reasons.map((x) => x.code), ['NOT_FUTURE', 'TOO_LONG', 'OVERLAP']);
  assert.match(r.reasons[2].message, /10:00-12:00/);
});

test('no room selected -> unavailable with NO_ROOM reason', () => {
  const r = checkAvailability({ start: 600, end: 660, now: NOW, room: null });
  assert.deepEqual(r, { available: false, reasons: [{ code: 'NO_ROOM', message: 'Select a room first.' }] });
});

test('time parsing: 24:00 allowed only as end (fixes A3 issue #3)', () => {
  assert.equal(parseHHMM('24:00', { allowEndOfDay: true }), 1440);
  assert.equal(parseHHMM('24:00'), null);
  assert.equal(parseHHMM('09:30'), 570);
  assert.equal(parseHHMM('9:75'), null);
  assert.equal(parseHHMM('abc'), null);
  assert.equal(check('A-101', parseHHMM('23:00'), parseHHMM('24:00', { allowEndOfDay: true })).available, true);
});
