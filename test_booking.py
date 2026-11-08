import copy
import os
import unittest
import importlib

MODULE = os.environ.get("BOOKING_MODULE", "booking")
can_book = importlib.import_module(MODULE).can_book

NOW = 540
EXISTING = [(600, 660)]


class TestCanBook(unittest.TestCase):
    def test_touching_end_available(self):
        self.assertIs(can_book(660, 720, NOW, False, EXISTING), True)

    def test_overlap_rejected(self):
        self.assertIs(can_book(630, 690, NOW, False, EXISTING), False)

    def test_blocked_room_rejected(self):
        self.assertIs(can_book(660, 720, NOW, True, EXISTING), False)

    def test_exactly_120_allowed(self):
        self.assertIs(can_book(720, 840, NOW, False, EXISTING), True)

    def test_121_rejected(self):
        self.assertIs(can_book(720, 841, NOW, False, EXISTING), False)

    def test_starts_now_rejected(self):
        self.assertIs(can_book(540, 570, NOW, False, EXISTING), False)

    def test_reversed_rejected(self):
        self.assertIs(can_book(720, 660, NOW, False, EXISTING), False)

    def test_zero_length_rejected(self):
        self.assertIs(can_book(700, 700, NOW, False, EXISTING), False)

    def test_end_of_day_1440_allowed(self):
        self.assertIs(can_book(1380, 1440, NOW, False, EXISTING), True)

    def test_end_after_1440_rejected(self):
        self.assertIs(can_book(1400, 1441, NOW, False, EXISTING), False)

    def test_negative_start_rejected(self):
        self.assertIs(can_book(-10, 30, 0, False, []), False)

    def test_between_two_bookings_available(self):
        self.assertIs(can_book(660, 720, NOW, False, [(600, 660), (720, 780)]), True)

    def test_overlap_second_booking(self):
        self.assertIs(can_book(700, 730, NOW, False, [(600, 660), (720, 780)]), False)

    def test_touch_start_available(self):
        self.assertIs(can_book(570, 600, NOW, False, EXISTING), True)

    def test_contains_booking_rejected(self):
        self.assertIs(can_book(590, 670, NOW, False, EXISTING), False)

    def test_inside_booking_rejected(self):
        self.assertIs(can_book(610, 650, NOW, False, EXISTING), False)

    def test_empty_bookings_available(self):
        self.assertIs(can_book(600, 660, NOW, False, []), True)

    def test_starts_one_minute_after_now(self):
        self.assertIs(can_book(541, 600, NOW, False, EXISTING), True)

    def test_start_before_now_rejected(self):
        self.assertIs(can_book(500, 560, NOW, False, EXISTING), False)

    def test_returns_strict_bool(self):
        self.assertIsInstance(can_book(660, 720, NOW, False, EXISTING), bool)

    def test_existing_not_mutated(self):
        existing = [(600, 660), (720, 780)]
        before = copy.deepcopy(existing)
        can_book(660, 720, NOW, False, existing)
        can_book(630, 690, NOW, False, existing)
        self.assertEqual(existing, before)

    def test_non_integer_minutes_rejected(self):
        self.assertIs(can_book(660.5, 720, NOW, False, EXISTING), False)
        self.assertIs(can_book("660", "720", NOW, False, EXISTING), False)
        self.assertIs(can_book(True, 60, 0, False, []), False)


if __name__ == "__main__":
    unittest.main()
