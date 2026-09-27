# VetTV Vintage PC — Empty shell + ISO-import UX

Status: outline for eng / design (2026-09-26 PT)  
Depends on: `ENGINE_COMPLIANCE_SPIKE.md` (86Box primary, BYO ISO/ROM)  
Host v1: Windows desktop (handheld layouts share the same flows with larger touch targets)

## Goal

A thin shell that can: list machines, create one with a guided wizard, point at a **user-owned** OS ISO, create a virtual disk, and launch 86Box with the right config. No OS downloads. No ROM downloads.

## Information architecture

```
Home (Machine library)
├── New machine (wizard)
├── Machine detail
│   ├── Start / Stop
│   ├── Snapshots
│   ├── Config (hardware preset, ISO path, disk, input profile)
│   └── Open data folder
├── Settings
│   ├── 86Box path / version
│   ├── ROM folder (user-selected)
│   ├── Controllers / touch overlay defaults
│   └── Legal / BYO notice
└── Compatibility list (read-only link or in-app stub)
```

## Screen 0 — First run

1. Short value prop: *Your ISOs. Your games. We handle setup, sound, and controls.*
2. Legal strip (always visible, not a wall of text): BYO OS + games; not affiliated with Microsoft.
3. **ROM folder** picker — required before first 9x machine. Copy: we do not include BIOS files; see 86Box docs (in-app link to upstream docs only).
4. Optional: locate 86Box binary if not bundled.

Exit criteria: ROM folder set (or user explicitly deferred with a sticky warning on Home).

## Screen 1 — Machine library (Home)

- Empty state CTA: **Create your first machine**
- Cards: name, guest era badge (95 / 98SE / 2000), last played, status (Ready / Needs ISO / Needs ROMs)
- Secondary actions: Import config (later), Open compatibility list

## Screen 2 — New machine wizard

Keep to four steps. No account. No storefront inside the wizard.

### Step A — Guest era
- Choices: Windows 95 · Windows 98 / 98SE · Windows 2000 (labeled “experimental” until smoke bar passes)
- Each choice loads a **hardware preset** (CPU class, RAM default, video, sound profile id)
- Helper text: DOS-only titles come later (DOSBox-X); do not offer DOS here in v1

### Step B — Name & disk
- Machine name (default from era + date)
- Disk size presets (e.g. 2 GB / 8 GB / 20 GB) + custom
- Create sparse/dynamic disk in app data; show path

### Step C — OS ISO (BYO)
- File picker for `.iso` / `.cue`+`.bin` if we support it later; v1: `.iso` only is fine
- Show filename + size; **never** fetch an ISO for them
- If skipped: machine status = Needs ISO; Start disabled with reason
- Tip block: where users typically keep install media they own (no download links)

### Step D — Review & create
- Summary: era, preset sound card, disk path, ISO path, ROM folder status
- Primary button: **Create machine**
- Secondary: Back

On create: write 86Box config from preset + paths; add card to library; land on Machine detail.

## Screen 3 — Machine detail

- **Start** → launch 86Box with this config (attach console log path for support later)
- **Mount / change ISO** — re-pick user file
- **Snapshots** — list, create, restore (even if v1 is “thin” wrappers over 86Box save states)
- **Input profile** — KBM default; gamepad profile pick; “Handheld overlay” toggle
- **Sound** — preset name + “If you hear nothing” checklist (host volume, 86Box audio device, guest drivers)
- Danger zone: Delete machine (keeps or deletes disks — ask once)

## Screen 4 — Settings (minimal)

- Paths: 86Box binary, ROM folder, machines root
- Controller deadzones / confirm capture key (to escape mouse trap)
- About: version, 86Box pin, licenses link (`THIRD_PARTY_NOTICES`), BYO statement

## Handheld / touch overlay (layout only for this outline)

- Floating d-pad + 2 face buttons + Start/Select + “keyboard” and “release mouse” affordances
- Same wizard steps; larger hit targets; avoid hover-only actions
- Target devices: Legion Go, Steam Deck, ROG Ally class — validate one device at smoke time

## Empty-shell MVP build order (implementation)

1. Window + nav shell + fake library with empty state  
2. Settings: ROM folder + 86Box path persistence  
3. Wizard steps A–D writing a config folder on disk (even if 86Box launch is stubbed)  
4. Launch 86Box process with generated config  
5. Machine detail: change ISO, open folder, delete  
6. Snapshot list UI wired to whatever 86Box exposes cleanly  
7. Touch overlay prototype on one handheld  

## Copy snippets (reuse in UI)

- ISO step title: **Select your Windows install image**
- ISO helper: **Use an ISO you own. VetTV does not provide Windows.**
- ROM gate: **Add your BIOS folder to continue. We never ship BIOS files.**
- Ready status: **Ready to start**
- Blocked: **Needs your OS ISO** / **Needs BIOS files**

## Acceptance for “empty shell + import flow”

- [ ] User can create a machine without an ISO and see a clear blocked state  
- [ ] User can attach an ISO from disk and status flips to Ready (ROMs permitting)  
- [ ] Start launches 86Box or shows an actionable error (missing binary / ROMs / config)  
- [ ] No UI path offers OS or ROM download  
- [ ] BYO / non-affiliation visible in first run and About  

## Non-goals for this outline

- Full installer automation inside the guest  
- Account sync / Plus  
- itch store chrome inside the app  
- Designing final visual brand (hand to design later with these flows)
