# Hiring HeRo

*Humanity Isn't Just a Resource.* A satirical pixel-art platformer: Sam, a Jr. Recruiter, frees ghosted candidates from OmniCorp's Applicant Tracking Void.

Level 1 is a free, mobile-first browser game. See [docs/level1-scope.md](docs/level1-scope.md).

## Run it

```sh
npm install
npm run dev      # http://localhost:5173 (also on your LAN for phone testing)
npm run build    # static site in dist/
```

## Controls

- **Phone (landscape):** ◀ ▶ on the left thumb, JUMP and FIRE on the right. Hold JUMP in the air to glide once you have the Copywriter Feather.
- **Keyboard:** arrows or A/D to move, Space/W/↑ to jump, J/X/Z to fire.

Add `?touch` to the URL to force the on-screen buttons on a desktop.

## Status

Greybox: all art is drawn in code (`src/scenes/Boot.js`) as placeholders for the AI art pass. Level layout lives in `src/level1-data.js`.
