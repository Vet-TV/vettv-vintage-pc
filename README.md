# VetTV Vintage PC

Paid nostalgia frontend for classic PC gaming. Users bring **their own** Windows 95 / 98 / 98SE / 2000 ISOs, BIOS/ROMs, and games. We wrap **86Box** with a guided machine library — we do not ship Microsoft ISOs, BIOS dumps, or pirated software, and we are **not affiliated with Microsoft**.

Status: **MVP v0 empty shell** (Electron + Vite + React + TypeScript).

## Legal / BYO

- Provide OS install images you own. VetTV never downloads or links Microsoft ISOs.
- Provide BIOS / option ROMs required by 86Box yourself. See [upstream 86Box docs](https://github.com/86Box/86Box) for filenames — never third-party dump archives from us.
- Games and software installers: only what you own.
- Marketing line: *Runs your classic PC OS images and games you own.*

## Stack

- Electron + electron-vite + React 18 + TypeScript
- Settings persistence: `electron-store` (JSON under Electron `userData`)
- Engine: spawn unmodified **86Box** (path configured in Settings). DOSBox-X is post-MVP.

## ROM status heuristic

A machine is marked **Needs BIOS files** unless Settings → ROM folder:

1. Exists on disk, and
2. Is non-empty **or** contains at least one `.rom` / `.bin` file.

We do **not** download ROMs. Refine filename checks later against a pinned 86Box ROM set list.

## Disk images (stubbed)

Creating a machine writes:

- `machine.json` — metadata
- `86box.cfg` — readable config stub (keys may need refinement for your pinned 86Box version)
- `disk.img` — **0-byte placeholder** plus `disk.img.placeholder` / `README.txt` explaining that a real image must be created with 86Box or `qemu-img` before a guest install works

## Develop (Linux box / Windows host)

```bash
cd /workspace/vettv-vintage-pc   # or your clone path
npm install
npm run dev
```

`npm run build` produces electron-vite output under `out/`.

### Point at 86Box

1. Install or build [86Box](https://github.com/86Box/86Box) yourself.
2. First-run or **Settings** → choose the 86Box binary.
3. Set a ROM folder containing BIOS files you obtained yourself.
4. Create a machine, attach your `.iso`, then **Start**.

If the binary or ROMs are missing, Start shows an actionable error — it never fetches them.

### Windows handheld note

Host target for v1 shipping is **Windows** (Legion Go / Steam Deck / ROG Ally class share the same flows with larger hit targets). This MVP is developed on Linux with Electron so the UI shell runs on the shared box; validate Start + touch overlays on a Windows handheld at smoke time.

## Repo layout

```
src/main, src/preload   Main + preload (IPC, machine CRUD, spawn 86Box)
src/renderer/      React UI (library, wizard, detail, settings, about)
presets/           win95 / win98se / win2000 hardware profile ids (no ROM bytes)
PROJECT_BRIEF.md
ENGINE_COMPLIANCE_SPIKE.md
UX_SHELL_ISO_IMPORT.md
THIRD_PARTY_NOTICES.md
```

## Scripts

| Command        | Purpose                |
|----------------|------------------------|
| `npm run dev`  | Electron + Vite HMR    |
| `npm run build`| Production compile     |
| `npm run preview` | Preview built app   |

## What is real vs stubbed

| Feature | Status |
|---------|--------|
| First-run + Settings persistence | Real |
| Machine library + status badges | Real |
| 4-step new-machine wizard | Real |
| machine.json + 86box.cfg stub | Real |
| Disk image creation | Stub (placeholder file) |
| Spawn 86Box with `-C` config | Real if binary path set |
| DOSBox-X | Not implemented |
| Snapshots / touch overlay | Not in v0 |
| Bundled 86Box binary | Not in v0 |

## License

Application code: proprietary / UNLICENSED for now. 86Box remains GPL-2.0 — see `THIRD_PARTY_NOTICES.md`.
