# Third-party notices — VetTV Vintage PC

This file is a stub for MVP v0. Expand before any public binary distribution.

## Electron
- Project: https://www.electronjs.org/
- License: MIT

## Vite
- Project: https://vitejs.dev/
- License: MIT

## React
- Project: https://react.dev/
- License: MIT

## electron-store
- License: MIT

## 86Box
- Project: https://github.com/86Box/86Box
- License: GPL-2.0 (confirm against the exact tag/commit pinned at release)
- Integration model (MVP): spawn an **unmodified** 86Box binary as a separate process with a generated config file. We do not fork 86Box source into this repository.
- If a future build **bundles** or **modifies** 86Box, include Corresponding Source (or a written offer meeting GPL terms) with the distribution, and keep this notice current.

## Other
- Hardware presets under `/presets` are VetTV JSON profiles (CPU/RAM/sound/video **ids only**). They contain **no** BIOS/ROM bytes.
