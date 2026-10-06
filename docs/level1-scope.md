# Hiring HeRo — Level 1 Scope (draft v1)

**Goal:** one polished, free, mobile-first browser level that makes people laugh and share. Success = ~50 LinkedIn shares.
**Bar:** looks professional (founder of an AI R&D lab is putting their name on it). Jumping is easy; the boss is the challenge.

## The level: "OmniCorp HQ → The Applicant Tracking Void"
Single horizontal level, ~3–4 minutes for a first clear.

| Section | What happens |
|---|---|
| Lobby (tutorial) | Move, jump, fire Dispatch Pistol. Ghost #1 on the path. |
| Open-plan office | Ghost #2 on path, Ghost #3 behind a destructible resume stack. First hazard: Buzzword Flashbang. |
| Copywriter Feather pickup | Rescuing Sarah (Copywriter) grants the suit: hold jump to glide. |
| Server floor | Ghost #4 on path, Ghost #5 behind a filing cabinet across a glide gap. Second hazard: Scope Creep Beam. |
| Boss: The ATS Overlord | Filing-cabinet/monitor monolith from the key art. Throws Rejection Fireballs. |
| Ending | Offer capsule → "THANK YOU FOR YOUR INTEREST! BUT OUR OFFER IS IN ANOTHER CASTLE." + nephew line. |
| Share screen | Ghosts found X/5, Reverse Rejection card, Share to LinkedIn + copy link. |

## Difficulty rules
- Platforming is forgiving: generous jump buffer and coyote time, no bottomless pits before the boss, checkpoint before the boss.
- **Boss scales with ghosts found.** Each rescued ghost joins the fight as a one-hit shield (matches the suit rule: the ghost absorbs the hit and ascends). With 5 ghosts the fight is comfortable; with 0–2 it usually wins. On a loss: "You need more allies. 3 candidates are still in the Void." → retry from checkpoint or replay the level.

## Cut from v1 (parked)
Hall of Shame, leaderboards, Candidate Ledger, Hub Room, other 3 suits, NDA Muzzle / Guilt Bomb / Golden Handcuffs, Steam.

## Controls
- Mobile (primary): landscape; left/right pad on the left thumb; Jump + Fire on the right thumb. Hold Jump = glide.
- Desktop: arrows/WASD, Space = jump, J/X = fire.

## Tech (proposed, versions to confirm at install)
Phaser 3 + TypeScript + Vite, 480×270 internal pixel resolution scaled to screen, deployed on Vercel at a shareable URL with an Open Graph preview image for LinkedIn.

## Art
AI-generated with a fixed style prompt and a fixed palette; characters ~32px tall; cleanup pass so animation frames stay consistent. Greybox (placeholder shapes) comes first, then art.

## Open assumptions to verify
1. Phaser 3 is still the right engine and its current version supports what we need. Check: install it and run a test scene.
2. LinkedIn shows the Open Graph image for our URL. Check: LinkedIn Post Inspector after deploy.
3. Touch controls feel OK on your phone. Check: greybox URL on your actual device.
4. AI sprites can be kept consistent across frames. Check: generate Sam's idle/run/jump set before generating anything else.
