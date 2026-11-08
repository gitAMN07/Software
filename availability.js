// Booking / availability rules AC1-AC5 + F3. Pure functions, never mutate input.
import { DAY_END, isIntMinute, formatHHMM } from './time.js';

export const MAX_DURATION = 120;

export const REASONS = Object.freeze({
  BLOCKED: 'This room is blocked and cannot be booked.',
  NOT_INTEGER: 'Times must be whole minutes.',
  OUT_OF_DAY: 'Start must be before end, within 00:00-24:00.',
  NOT_FUTURE: 'Start time must be later than the current time.',
  TOO_LONG: `A booking can last at most ${MAX_DURATION} minutes.`,
  OVERLAP: 'Overlaps an existing booking',
  NO_ROOM: 'Select a room first.',
});

/** Half-open intervals [a1,a2) and [b1,b2) overlap? Touching endpoints do not. (AC4) */
export const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

/**
 * Check a request against ONE room's own data.
 * @returns {{available: boolean, reasons: {code: string, message: string}[]}}
 */
export function checkAvailability({ start, end, now, room }) {
  const reasons = [];
  const add = (code, extra = '') => reasons.push({ code, message: REASONS[code] + extra });

  if (!room) {
    add('NO_ROOM');
    return { available: false, reasons };
  }
  if (room.blocked) add('BLOCKED'); // AC3 / F3

  if (!isIntMinute(start) || !isIntMinute(end)) {
    add('NOT_INTEGER'); // AC1
  } else {
    if (!(start >= 0 && start < end && end <= DAY_END)) add('OUT_OF_DAY'); // AC1
    if (start <= now) add('NOT_FUTURE'); // AC1
    if (end - start > MAX_DURATION) add('TOO_LONG'); // AC2
    for (const b of room.bookings) { // AC4 - only the chosen room's bookings
      if (overlaps(start, end, b.start, b.end)) {
        add('OVERLAP', ` (${formatHHMM(b.start)}-${formatHHMM(b.end)}).`);
      }
    }
  }
  return { available: reasons.length === 0, reasons }; // AC5 read-only
}

/** Backwards-compatible A3 contract: can_book(start, end, now, blocked, existing) -> bool. */
export function canBook(start, end, now, blocked, existing) {
  const room = { blocked, bookings: existing.map(([s, e]) => ({ start: s, end: e })) };
  return checkAvailability({ start, end, now, room }).available;
}
