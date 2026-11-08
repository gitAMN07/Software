// Filtering rules F1, F2, F4, F5.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROOMS } from '../src/data/rooms.js';
import { filterRooms, reconcileSelection } from '../src/domain/filtering.js';

const ids = (rooms) => rooms.map((r) => r.id);

test('F1: exact capacity matches (12 attendees -> A-101 cap 12 included)', () => {
  assert.ok(ids(filterRooms(ROOMS, { attendees: 12 })).includes('A-101'));
});

test('F1: insufficient capacity excluded (13 attendees -> A-101 excluded)', () => {
  const r = ids(filterRooms(ROOMS, { attendees: 13 }));
  assert.ok(!r.includes('A-101'));
  assert.deepEqual(r, ['B-204', 'D-110']);
});

test('F2: room must contain ALL selected equipment', () => {
  assert.deepEqual(ids(filterRooms(ROOMS, { equipment: ['projector'] })), ['A-101', 'B-204', 'D-110']);
  assert.deepEqual(ids(filterRooms(ROOMS, { equipment: ['projector', 'computers'] })), ['B-204']);
  assert.deepEqual(ids(filterRooms(ROOMS, { equipment: ['video', 'whiteboard'] })), ['E-012']);
});

test('F1+F2 combined', () => {
  assert.deepEqual(ids(filterRooms(ROOMS, { attendees: 8, equipment: ['whiteboard'] })), ['A-101', 'B-204', 'E-012']);
});

test('F3: blocked rooms remain listed (shown with a Blocked badge) when they match', () => {
  assert.ok(ids(filterRooms(ROOMS, { attendees: 50 })).includes('D-110'));
});

test('F4: no match returns an empty list (UI shows empty state)', () => {
  assert.deepEqual(filterRooms(ROOMS, { attendees: 100 }), []);
  assert.deepEqual(filterRooms(ROOMS, { attendees: 5, equipment: ['computers', 'microphone'] }), []);
});

test('F5: selection kept if still visible, cleared if filtered out', () => {
  const big = filterRooms(ROOMS, { attendees: 20 });
  assert.equal(reconcileSelection(big, 'B-204'), 'B-204');
  assert.equal(reconcileSelection(big, 'C-305'), null);
});

test('filtering does not mutate the catalog; invalid attendees default to 1', () => {
  const before = JSON.stringify(ROOMS);
  filterRooms(ROOMS, { attendees: -3, equipment: [] });
  assert.equal(JSON.stringify(ROOMS), before);
  assert.equal(filterRooms(ROOMS, { attendees: -3 }).length, ROOMS.length);
});
