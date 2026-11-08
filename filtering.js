// Room filtering rules F1, F2 (pure). Blocked rooms stay visible but are never "available" (F3 in availability.js).

/** F1: capacity >= attendees. */
export const hasCapacity = (room, attendees) => room.capacity >= attendees;

/** F2: room contains ALL required equipment. */
export const hasEquipment = (room, required) => required.every((id) => room.equipment.includes(id));

/**
 * @param {readonly object[]} rooms
 * @param {{attendees?: number, equipment?: string[]}} criteria
 * @returns {object[]} new array; input is never modified
 */
export function filterRooms(rooms, { attendees = 1, equipment = [] } = {}) {
  const n = Number.isInteger(attendees) && attendees > 0 ? attendees : 1;
  return rooms.filter((r) => hasCapacity(r, n) && hasEquipment(r, equipment));
}

/** F5 helper: keep the selection only if the room is still in the filtered list. */
export function reconcileSelection(filtered, selectedId) {
  return filtered.some((r) => r.id === selectedId) ? selectedId : null;
}
