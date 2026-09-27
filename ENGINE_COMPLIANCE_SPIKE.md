# VetTV Vintage PC — Engine & compliance spike

Status: draft for eng handoff (2026-09-26 PT)  
Decision owner: Vet  
Primary engine (MVP): **86Box** (PCem-class fidelity)  
Secondary (post-MVP): DOSBox-X for pure DOS titles  
Escape hatch (later): QEMU only if Win2000 quality bar is not met on 86Box

## 1. Product decision (locked)

Wrap **86Box first** so Win95 / 98 / 98SE machine setups feel like real PCs (chipset, sound, BIOS era), not a DOS-centric compatibility layer.

DOSBox-X remains the right tool for many MS-DOS games, but it is **not** the MVP runtime. Do not dual-ship two engines in v1 UX.

## 2. What we ship vs what the user brings

| Component | Who provides it | Notes |
|-----------|-----------------|-------|
| VetTV Vintage PC app (frontend, wizard, presets, input overlays) | Us | Paid one-time app |
| 86Box runtime (unmodified upstream build preferred) | Us (bundled or downloaded with clear attribution) | See GPL §4 |
| Machine presets / config templates (SB16, AC97-style, typical 95/98 hardware) | Us | No copyrighted ROM blobs inside presets |
| Guest OS ISO (MS-DOS, Win95, 98, 98SE, 2000) | **User only** | Never ship, mirror, link to, or generate Microsoft ISOs |
| BIOS / VGA / network option ROMs required by 86Box | **User only** | Point to official 86Box ROM documentation; never host dumps |
| Game / software installers | **User only** | No pirated games; no “download this abandonware” links |

Marketing line to keep: *Runs your classic PC OS images and games you own.*

## 3. Engine choice detail

### 86Box (choose)
- Strengths: machine-level fidelity for 9x; configurable chipsets, sound cards, video; community machine configs map well to “guided VM” UX.
- Fit: Windows 95 / 98 / 98SE primary; Windows 2000 as stretch profile if smoke tests pass.
- Risk: ROM dependency is confusing for newcomers — wizard must explain *user-supplied ROMs* without sounding like we sell Windows.

### PCem (reference only in v1)
- Use historical configs / community knowledge as research input.
- Do **not** maintain a second PCem binary path in MVP unless 86Box is blocked by a concrete bug we cannot work around.

### DOSBox-X (phase 2)
- Add after Win9x path is shippable.
- Separate “DOS game” preset family; do not pretend one engine covers everything.

### QEMU (escape hatch)
- Consider only if 2000 (or a must-have title class) fails 86Box quality bar.
- Heavier UX and different mental model; keep out of v1 marketing.

## 4. License & distribution compliance

### 86Box
- Upstream license: **GPL-2.0** (confirm against the exact tag/commit we pin before each release).
- Preferred integration: **spawn / embed unmodified official builds** (or our rebuild from unmodified sources) behind our UI. Avoid proprietary forks of the engine.
- If we distribute a **modified** 86Box binary, or combine in a way that creates a derivative we distribute:
  - Provide Corresponding Source (or a written offer valid for the GPL term) with the itch/Steam build.
  - Keep a `THIRD_PARTY_NOTICES` file in the installer and repo.
  - Do not relicense 86Box code as proprietary.
- Our own app code (wizard, UI, presets JSON, overlays) can stay proprietary if it remains a separate work that talks to 86Box over process/config boundaries. Have counsel or a license-savvy eng review the final link/bundle model before Steam/itch upload — this spike is not legal advice.

### Other third-party
- Any bundled libraries (audio, UI toolkit, controller mappers) get their own notice entries.
- Controller / on-screen keyboard assets: only content we own or have license for.

### Explicitly forbidden in any build artifact or CDN
- Microsoft Windows ISOs or product keys
- BIOS/option ROM dump archives
- Commercial game ROMs/ISOs/installers we do not have redistribution rights for
- Fake “Microsoft partner” / “official Windows emulator” claims

## 5. ROM / BIOS policy (UX + legal)

1. First-run (or first 86Box machine): short screen — *86Box needs BIOS files you obtain yourself. We do not include them.*
2. Link only to **upstream 86Box documentation** describing required ROM filenames (not third-party dump sites).
3. App checks for expected ROM filenames in a user-chosen folder; if missing, show a checklist — never auto-download ROMs.
4. Presets reference hardware generically (`sb16`, `pcivga`, etc.) without embedding ROM bytes.

## 6. Guest OS install policy

- Wizard accepts a **path to a user ISO** (or physical/optical later). Validate file exists; optional hash display for user confidence — do not reject based on Microsoft product detection in a way that helps piracy, and do not help users find cracked ISOs.
- Install tips are textual (partition, typical gotchas). No silent OS download.
- Snapshots and disk images live in a VetTV-managed user data directory; disks are the user’s data.

## 7. Pinning & updates

- Pin an exact 86Box version (tag + hash) in release notes.
- Auto-update policy (later): update our app freely; engine bumps are deliberate and regression-tested against the smoke list.
- Compatibility list stays public and honest: only titles we actually tested.

## 8. Spike acceptance checklist (before empty-shell coding is “done enough”)

- [ ] Confirm GPL obligations for chosen bundle model (spawn unmodified vs modified).
- [ ] `THIRD_PARTY_NOTICES` stub exists in repo.
- [ ] ROM first-run copy reviewed (BYO, no dump links).
- [ ] One Win98SE smoke path documented on desktop host.
- [ ] Handheld note: same machine config + touch overlay layout sketch (implementation can follow).

## 9. Out of scope for this spike

- Implementing the app shell (see `UX_SHELL_ISO_IMPORT.md`)
- itch listing prose (separate draft)
- Android / Play policy
- XP profile

## 10. Recommendation summary

**Ship MVP on 86Box + proprietary frontend + strict BYO ISO/ROM/games.** Treat GPL with a source offer when required, never ship Microsoft or BIOS dumps, and add DOSBox-X only after the 9x fidelity path is real.
