# M.GAMES — Testing Guide

## Automated tests

```bash
npm test          # Vitest unit tests (games/logic)
npm run test:e2e  # Playwright smoke tests
npm run build     # Regenerate sw.js + sitemap.xml from catalog.json
```

## Manual checklist (every game)

- [ ] Start → play → game over / win → restart clears state
- [ ] High score persists after reload when applicable
- [ ] Pause (`P`) or tab blur freezes gameplay (canvas games)
- [ ] Mobile: touch works, no horizontal scroll, canvas scales
- [ ] Keyboard controls work; no stuck keys after alt-tab
- [ ] No console errors during 5-minute session
- [ ] Offline: page loads after first visit (service worker)

## Live catalog (13 games)

Open `/games/`, filter by genre, launch each card.

| Slug | Genre |
|------|-------|
| wordle | Word |
| snake | Arcade |
| tetris | Arcade |
| flappy | Arcade |
| tower | Arcade |
| 2048 | Puzzle |
| memory | Memory |
| tictactoe | Strategy |
| connect4 | Strategy |
| space | Action |
| whack | Skill |
| pong | Skill |
| dice-wars | Board |

## Logic-only modules (unit tested, no HTML shell)

`hangman`, `word-scramble`, `quiz`, `mix-master`, `solitaire`, `idle-farm`, `bloxorz`, `click-island` — covered by Vitest under `games/tests/`.
