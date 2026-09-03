# SudoNeko

A cat logic puzzle PWA. One cat per row, per column and per colour patch, and no two cats touching — not even at the corners.

## Run it

```bash
npm install
npm run dev
```

Open the printed URL on your phone (same Wi-Fi) or in a browser. `npm run build` produces an installable PWA in `dist/`; `npm run preview` serves it so you can test "Add to home screen".

## Unlocking cats

Colour themes are open from the start. Cats unlock on **levels solved**, not level number: Calico from the start, Shadow at 2 wins, Siamese at 5, Tabby at 10, Robo at 25, Cosmic at 50, Persian at 100. Five wins also opens the custom cat editor — fur, markings, marking colour, eye colour, eye shape, ears and collar, each with its own set of options.

## Auto markings

Answer yes to the welcome question (or flip it in settings) and placing a cat crosses off its row, column, colour patch and the eight squares around it. The marks are derived from the cats on the board, so removing a cat removes exactly the marks it caused and keeps any that another cat still justifies. On an auto-marked square a single tap places a cat, skipping the cross.

## Solver

The Solver button opens a blank board. Pick a size, paint the colour patches, hit Solve, and the backtracking search returns an arrangement — or tells you the patches admit none, or more than one.

## Saving to Google Drive

The Google button syncs to the Drive `appDataFolder`, which is private to this app. It merges rather than overwrites: cleared levels are unioned, best times keep the faster of the two, nothing is ever deleted. Set `VITE_GOOGLE_CLIENT_ID` (see `.env.example`) and add the same value as a repository secret for the Pages workflow. While the OAuth consent screen is unverified, Google shows a "not safe" warning to anyone outside your test users.

## How it works

- `src/utils/difficulty.js` — level number to difficulty and grid size. Base tier rises every 50 levels, every 5th level spikes one tier: 1–4 Easy, 5 Medium, 46–49 Easy, 50–54 Medium, 55 Hard, 56–59 Medium.
- `src/utils/levelGenerator.js` — places a valid cat arrangement by backtracking, grows colour regions from those cats, then repairs region borders until a full backtracking search finds exactly one solution. A second, human-style solver then rates the puzzle: Easy levels are regenerated until they fall to single-candidate deductions alone, Medium until plain logic is enough. Levels are seeded by number, so level 42 is the same puzzle on every device.
- `src/utils/storage.js` — level, cleared levels, best times, theme, cat skin, custom cat and settings in `localStorage`, plus the merge rules used by Drive sync.
- `src/styles/themes.css` — seven palettes swapped at runtime through `data-theme` on `<html>`.
- `src/components/CatIcon.jsx` — seven cat skins drawn as inline SVG.

## Tapping

Empty → cross (no cat here) → cat → empty. Cats that break a rule get a red ring; the win modal appears the moment the board is legal.
