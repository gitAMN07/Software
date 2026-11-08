// Presentation only: turns state into HTML strings. No rules here.
import { formatHHMM } from '../domain/time.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function renderRoomList(rooms, selectedId, equipmentLabels) {
  if (rooms.length === 0) {
    return '<p class="empty" data-testid="empty-state">No rooms match your requirements. '
      + 'Try fewer attendees or fewer equipment items.</p>'; // F4
  }
  return rooms.map((r) => {
    const eq = r.equipment.map((id) => esc(equipmentLabels[id] ?? id)).join(', ');
    const sel = r.id === selectedId;
    return `<label class="room${sel ? ' selected' : ''}${r.blocked ? ' blocked' : ''}" data-room="${esc(r.id)}">
      <input type="radio" name="room" value="${esc(r.id)}"${sel ? ' checked' : ''}>
      <span class="room-name">${esc(r.name)}</span>
      ${r.blocked ? '<span class="badge">Blocked</span>' : ''}
      <span class="room-meta">Capacity ${r.capacity} &middot; ${eq}</span>
    </label>`;
  }).join('');
}

export function renderBookings(room) {
  if (!room) return '';
  if (room.bookings.length === 0) return '<li>No bookings today</li>';
  return room.bookings.map((b) => `<li>${formatHHMM(b.start)}-${formatHHMM(b.end)}</li>`).join('');
}

export function renderResult(result, { hint } = {}) {
  if (hint) return `<p class="hint" data-testid="result">${esc(hint)}</p>`;
  if (result.available) {
    return '<div class="result ok" data-testid="result" role="status"><strong>Available</strong></div>';
  }
  const items = result.reasons.map((r) => `<li>${esc(r.message)}</li>`).join('');
  return `<div class="result bad" data-testid="result" role="status"><strong>Unavailable</strong>
    <ul class="reasons">${items}</ul></div>`;
}
