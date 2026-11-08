# Smart Campus Room Availability Checker - Assignment #04

Author: Sabit Amina · AI assistant: Claude (Anthropic, Claude Opus 5.5) · 8 November 2026

```
initial/            Assignment #03 baseline (Python, one room)
  booking.py        final A3 version  can_book(start, end, now, blocked, existing)
  booking_v1.py     first AI version from A3 (kept for comparison)
  test_booking.py   22 unittest cases (AC1-AC5)
final/              Assignment #04 version (JavaScript ES modules, no dependencies at runtime)
  index.html        page shell
  src/data/rooms.js           fictional catalog of 5 rooms, NOW = 09:00 (deep-frozen)
  src/domain/time.js          HH:MM parsing/formatting
  src/domain/availability.js  AC1-AC4 + F3 rules, canBook() keeps the A3 contract
  src/domain/filtering.js     F1 capacity, F2 equipment, F5 selection reconcile
  src/ui/view.js              HTML rendering (room list, empty state F4, result + reasons)
  src/ui/app.js               controller: state + events
  src/ui/styles.css           responsive layout (1 column < 800 px)
  tests/*.test.mjs            39 unit/regression tests + 4 Playwright UI tests
evidence/           actual test output, screenshots, diagrams
```

## Requirements
- Python 3.10+ (baseline tests only)
- Node.js 20+ (tested on 22.23)
- For UI tests: `npm install` then `npx playwright install chromium`

## Run the app
```bash
cd final
python3 -m http.server 8000      # or: npm start
# open http://localhost:8000
```
ES modules do not load from file://, so a local static server is required (no backend, no API).

## Run tests
```bash
# baseline (Assignment #03)
cd initial
python3 -m unittest -v test_booking                         # 22/22 OK
BOOKING_MODULE=booking_v1 python3 -m unittest test_booking  # 21/22 (known v1 defect)

# final (Assignment #04)
cd final
npm install && npx playwright install chromium
npm test            # node --test "tests/*.test.mjs"  -> 43/43
npm run test:unit   # 39 tests, no browser needed
npm run test:ui     # 4 browser tests
# use an installed Chrome instead of downloading Chromium:
CHROME_PATH=/usr/bin/google-chrome npm test
```
