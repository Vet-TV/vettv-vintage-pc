# VetTV Vintage PC — Project brief

Status: kickoff (2026-09-25 PT)  
Owner bot: VetTV Vintage PC  
Brand: VetTV / VetTV Studios / Retro TV Archive

## Pitch
Paid nostalgia frontend for classic PC gaming. Users bring **their own** MS-DOS / Windows 95 / 98 / 98SE / 2000 images and **games they own**. We sell setup quality: sound, keyboard/mouse, controllers, handheld touch controls — not Windows itself.

## Non-negotiables
- BYO OS ISO + BYO games only (no Microsoft ISOs, no pirated games shipped or linked).
- Honest marketing (no “official Windows,” no “plays every game”).
- Core local play is one-time purchase; subscriptions only for extras (sync, preset packs, support).

## MVP (v1)
1. Desktop app (Windows host first; Linux/macOS later if easy).
2. Engines: DOSBox-X (DOS) + 86Box or QEMU profile for 9x/2000 (final pick in spike).
3. Wizard: create machine → select user ISO → create disk → install tips.
4. Input: KBM + gamepad profiles + basic touch overlay layout for handhelds.
5. Sound: sane default SB16 / AC97-style profiles documented per guest.
6. itch.io listing + $14.99 launch / $19.99 standard pricing draft.

## Later
- Yearly Plus (configs sync, preset packs, priority support).
- Android port (policy-aware; sideload/itch if Play blocks).
- Optional XP profile only if quality bar met.

## Explicitly not this repo
- Web fake-XP desktop (separate product).
- ReactOS/Bliss bare-metal tooling.

## First engineering spike
- [ ] Choose engine stack and license compliance notes
- [ ] Empty app shell + “import ISO” flow mock
- [ ] One DOS title + one Win98 title smoke test on Legion Go or PC
- [ ] Store listing copy (BYO language)
