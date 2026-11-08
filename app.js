// Controller: holds UI state, wires DOM events, calls pure rules, renders via view.js.
import { ROOMS, EQUIPMENT, NOW, findRoom } from '../data/rooms.js';
import { checkAvailability } from '../domain/availability.js';
import { filterRooms, reconcileSelection } from '../domain/filtering.js';
import { parseHHMM, formatHHMM } from '../domain/time.js';
import { renderRoomList, renderBookings, renderResult } from './view.js';

const labels = Object.fromEntries(EQUIPMENT.map((e) => [e.id, e.label]));

export function mount(doc = document) {
  const $ = (id) => doc.getElementById(id);
  const state = { selectedId: null };

  $('now').textContent = formatHHMM(NOW);
  $('equipment').innerHTML = EQUIPMENT.map((e) =>
    `<label class="chip"><input type="checkbox" value="${e.id}"> ${e.label}</label>`).join('');

  function readCriteria() {
    const attendees = Number.parseInt($('attendees').value, 10);
    const equipment = [...$('equipment').querySelectorAll('input:checked')].map((i) => i.value);
    return { attendees: Number.isNaN(attendees) ? 1 : attendees, equipment };
  }

  function update() {
    const filtered = filterRooms(ROOMS, readCriteria());
    state.selectedId = reconcileSelection(filtered, state.selectedId); // F5
    $('rooms').innerHTML = renderRoomList(filtered, state.selectedId, labels);
    $('count').textContent = `${filtered.length} of ${ROOMS.length} rooms`;

    const room = findRoom(filtered, state.selectedId);
    $('bookings').innerHTML = renderBookings(room);
    $('room-title').textContent = room ? room.name : 'No room selected';

    const start = parseHHMM($('start').value);
    const end = parseHHMM($('end').value, { allowEndOfDay: true });
    let html;
    if (!room) html = renderResult(null, { hint: 'Select a room to check availability.' });
    else if (start === null || end === null) html = renderResult(null, { hint: 'Enter start and end as HH:MM (end may be 24:00).' });
    else html = renderResult(checkAvailability({ start, end, now: NOW, room }));
    $('result').innerHTML = html;
  }

  $('filters').addEventListener('input', update);
  $('times').addEventListener('input', update);
  $('rooms').addEventListener('change', (e) => {
    if (e.target.name === 'room') { state.selectedId = e.target.value; update(); }
  });
  update();
  return { update, state };
}

if (typeof document !== 'undefined') mount();
