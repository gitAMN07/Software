// Room data only (fictional). No rules, no UI.
// Times are integer minutes after midnight; bookings are half-open [start, end).

const deepFreeze = (obj) => {
  Object.values(obj).forEach((v) => {
    if (v && typeof v === 'object' && !Object.isFrozen(v)) deepFreeze(v);
  });
  return Object.freeze(obj);
};

/** Fixed "current time" for the prototype: 09:00. */
export const NOW = 540;

export const EQUIPMENT = deepFreeze([
  { id: 'projector', label: 'Projector' },
  { id: 'whiteboard', label: 'Whiteboard' },
  { id: 'computers', label: 'Computers' },
  { id: 'microphone', label: 'Microphone' },
  { id: 'video', label: 'Video conferencing' },
]);

export const ROOMS = deepFreeze([
  {
    id: 'A-101', name: 'Seminar Room A-101', capacity: 12,
    equipment: ['projector', 'whiteboard'], blocked: false,
    bookings: [{ start: 600, end: 660 }],
  },
  {
    id: 'B-204', name: 'Computer Lab B-204', capacity: 30,
    equipment: ['projector', 'computers', 'whiteboard'], blocked: false,
    bookings: [{ start: 600, end: 720 }, { start: 780, end: 840 }],
  },
  {
    id: 'C-305', name: 'Study Pod C-305', capacity: 4,
    equipment: ['whiteboard'], blocked: false,
    bookings: [{ start: 660, end: 720 }],
  },
  {
    id: 'D-110', name: 'Lecture Hall D-110', capacity: 80,
    equipment: ['projector', 'microphone', 'video'], blocked: true,
    bookings: [{ start: 720, end: 780 }],
  },
  {
    id: 'E-012', name: 'Meeting Room E-012', capacity: 8,
    equipment: ['video', 'whiteboard'], blocked: false,
    bookings: [{ start: 570, end: 630 }, { start: 900, end: 960 }],
  },
]);

export const findRoom = (rooms, id) => rooms.find((r) => r.id === id) ?? null;
