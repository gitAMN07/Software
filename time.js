// Time helpers shared by rules and UI (single place for HH:MM parsing).
export const DAY_END = 1440;

export const isIntMinute = (v) => Number.isInteger(v);

/** "HH:MM" -> minutes. "24:00" is accepted only when allowEndOfDay is true. Returns null if invalid. */
export function parseHHMM(text, { allowEndOfDay = false } = {}) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(text ?? '').trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (min > 59) return null;
  if (h === 24 && min === 0 && allowEndOfDay) return DAY_END;
  if (h > 23) return null;
  return h * 60 + min;
}

export function formatHHMM(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}
