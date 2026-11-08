"""Smart Campus Room Availability Checker - Assignment #03 baseline (final A3 version).

Single room. can_book(start, end, now, blocked, existing) -> bool
AC1 integer minutes, 0 <= start < end <= 1440, start > now
AC2 duration <= 120 minutes
AC3 blocked room -> always False
AC4 no overlap with existing bookings, half-open [start, end)
AC5 read-only, returns a strict bool
"""

DAY_END = 1440
MAX_DURATION = 120


def _is_int(value):
    return isinstance(value, int) and not isinstance(value, bool)


def can_book(start, end, now, blocked, existing):
    if blocked:                                   # AC3
        return False
    if not (_is_int(start) and _is_int(end)):     # AC1 integer minutes
        return False
    if not (0 <= start < end <= DAY_END):         # AC1 day bounds
        return False
    if start <= now:                              # AC1 start strictly after now
        return False
    if end - start > MAX_DURATION:                # AC2
        return False
    for b_start, b_end in existing:               # AC4 half-open overlap
        if start < b_end and b_start < end:
            return False
    return True                                   # AC5 no writes
