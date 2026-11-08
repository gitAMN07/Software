"""First AI-generated version (Assignment #03) - kept unchanged for comparison."""


def can_book(start, end, now, blocked, existing):
    if blocked:
        return False
    if not (0 <= start < end <= 1440):
        return False
    if start <= now:
        return False
    if end - start > 120:
        return False
    for b_start, b_end in existing:
        if start < b_end and b_start < end:
            return False
    return True
