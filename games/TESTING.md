# M.GAMES — Testing Guide

## Automated tests

```bash
npm test          # Vitest unit tests (games/logic)
npm run test:e2e  # Playwright smoke tests
```

## Manual checklist (every game)

- [ ] Start → play → game over / win → restart clears state
- [ ] High score persists after reload when applicable
- [ ] Pause (`P`) or tab blur freezes gameplay (canvas games)
- [ ] Mobile: touch works, no horizontal scroll, canvas scales
- [ ] Keyboard controls work; no stuck keys after alt-tab
- [ ] No console errors during 5-minute session
- [ ] Offline: page loads after first visit (service worker)

## Per-wave smoke URLs

Open `/games/index.html`, filter by genre, launch 2 random cards per genre.

| Wave | Games |
|------|-------|
| Original 14 | wordle, snake, 2048, memory, tetris, flappy, breakout, tictactoe, space, dino, whack, pong, tower, connect4 |
| Wave 1 | hangman, word-scramble, trick-quiz, brain-check, idle-farm, mix-master, solitaire |
| Wave 2 | gold-hook, bubble-spin, bull-run, neon-drift, cell-feast, home-run, block-roll, tile-link |
| Wave 3 | dice-wars, lane-defense, pizza-queue, diner-rush, balloon-td |
| Wave 4 | hex-conquest, neon-pool |
