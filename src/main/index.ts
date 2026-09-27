import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  shell
} from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync, statSync } from 'fs'
import { spawn, ChildProcess } from 'child_process'
import Store from 'electron-store'
import type { AppSettings, GuestEra, MachineStatus } from '../shared/types'

export type { GuestEra }

export interface MachineMeta {
  id: string
  name: string
  era: GuestEra
  createdAt: string
  lastPlayedAt: string | null
  diskSizeGb: number
  isoPath: string | null
  presetId: string
  folderName: string
}

interface MachineCard extends MachineMeta {
  status: MachineStatus
  folderPath: string
}

const DEFAULT_SETTINGS: AppSettings = {
  romFolder: '',
  eightySixBoxPath: '',
  machinesRoot: '',
  firstRunComplete: false
}

const store = new Store<AppSettings>({
  name: 'settings',
  defaults: DEFAULT_SETTINGS
})

let mainWindow: BrowserWindow | null = null
const running: Map<string, ChildProcess> = new Map()

function getMachinesRoot(): string {
  const stored = store.get('machinesRoot')
  if (stored && stored.length > 0) return stored
  const fallback = join(app.getPath('userData'), 'machines')
  if (!existsSync(fallback)) mkdirSync(fallback, { recursive: true })
  return fallback
}

function ensureMachinesRoot(): string {
  const root = getMachinesRoot()
  if (!existsSync(root)) mkdirSync(root, { recursive: true })
  if (!store.get('machinesRoot')) store.set('machinesRoot', root)
  return root
}

function romsPresent(romFolder: string): boolean {
  if (!romFolder || !existsSync(romFolder)) return false
  try {
    const entries = readdirSync(romFolder)
    if (entries.length === 0) return false
    // Heuristic: folder set + non-empty, OR any .rom/.bin file present
    const hasRomLike = entries.some((e) => /\.(rom|bin)$/i.test(e))
    return hasRomLike || entries.length > 0
  } catch {
    return false
  }
}

function computeStatus(meta: MachineMeta): MachineStatus {
  const romOk = romsPresent(store.get('romFolder') || '')
  if (!romOk) return 'Needs ROMs'
  if (!meta.isoPath || !existsSync(meta.isoPath)) return 'Needs ISO'
  return 'Ready'
}

function resolvePresetPath(era: GuestEra): string | null {
  const candidates = [
    join(app.getAppPath(), 'presets', `${era}.json`),
    join(process.cwd(), 'presets', `${era}.json`),
    join(__dirname, '../../presets', `${era}.json`),
    join(__dirname, '../../../presets', `${era}.json`)
  ]
  for (const p of candidates) {
    if (existsSync(p)) return p
  }
  return null
}

function loadPreset(era: GuestEra): Record<string, unknown> {
  const path = resolvePresetPath(era)
  if (!path) {
    const defaults: Record<GuestEra, Record<string, unknown>> = {
      win95: {
        id: 'win95',
        label: 'Windows 95',
        machineType: 'premier',
        cpu: 'pentium',
        cpuSpeed: 100000000,
        ramMb: 32,
        soundProfileId: 'sb16',
        videoProfileId: 'pcivga'
      },
      win98se: {
        id: 'win98se',
        label: 'Windows 98 / 98SE',
        machineType: 'premier',
        cpu: 'pentium2',
        cpuSpeed: 300000000,
        ramMb: 128,
        soundProfileId: 'sb16',
        videoProfileId: 'pcivga'
      },
      win2000: {
        id: 'win2000',
        label: 'Windows 2000 (experimental)',
        machineType: '5600xii',
        cpu: 'pentium2',
        cpuSpeed: 450000000,
        ramMb: 256,
        soundProfileId: 'es1371',
        videoProfileId: 'pcivga'
      }
    }
    return defaults[era]
  }
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function writeEightySixBoxConfig(
  machineDir: string,
  meta: MachineMeta,
  preset: Record<string, unknown>
): void {
  const romFolder = store.get('romFolder') || ''
  const diskPath = join(machineDir, 'disk.img')
  const isoLine = meta.isoPath
    ? `cdrom_path = ${meta.isoPath.replace(/\\/g, '/')}`
    : `# cdrom_path = (attach your BYO ISO)`

  // Documented placeholder CFG — real 86Box schema varies by version.
  // Users/point releases can refine; MVP writes a readable stub the launcher passes via -C.
  const cfg = `# VetTV Vintage PC — 86Box config stub
# Machine: ${meta.name} (${meta.id})
# Era: ${meta.era}
# Preset: ${String(preset.id || meta.presetId)}
# This is an MVP placeholder. Pin an 86Box version and refine keys against upstream docs.
# ROMs: place BIOS files in the folder configured in Settings (never shipped by VetTV).

[General]
emu_build_num = 0
vid_renderer = qt_software
confirm_exit = 0

[Machine]
machine = ${String(preset.machineType || 'premier')}
cpu_family = ${String(preset.cpu || 'pentium')}
cpu_speed = ${String(preset.cpuSpeed || 166666666)}
fpu = 1
cpu_use_dynarec = 1
mem_size = ${(Number(preset.ramMb) || 64) * 1024}

[Video]
gfxcard = ${String(preset.videoProfileId || 'pcivga')}

[Sound]
sndcard = ${String(preset.soundProfileId || 'sb16')}

[Hard disks]
hdd_01_parameters = ${meta.diskSizeGb * 1024},16,63
hdd_01_fn = ${diskPath.replace(/\\/g, '/')}

[CD-ROM]
cdrom_01_speed = 24
cdrom_01_parameters = 1, atapi
${isoLine}

[Rom paths]
roms_path = ${romFolder.replace(/\\/g, '/')}
`

  writeFileSync(join(machineDir, '86box.cfg'), cfg, 'utf-8')
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  return base || 'machine'
}

function listMachines(): MachineCard[] {
  const root = ensureMachinesRoot()
  const cards: MachineCard[] = []
  let dirs: string[] = []
  try {
    dirs = readdirSync(root).filter((d) => {
      try {
        return statSync(join(root, d)).isDirectory()
      } catch {
        return false
      }
    })
  } catch {
    return []
  }

  for (const dir of dirs) {
    const metaPath = join(root, dir, 'machine.json')
    if (!existsSync(metaPath)) continue
    try {
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8')) as MachineMeta
      cards.push({
        ...meta,
        folderName: dir,
        folderPath: join(root, dir),
        status: computeStatus(meta)
      })
    } catch {
      // skip corrupt
    }
  }

  cards.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  return cards
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 800,
    minHeight: 560,
    show: false,
    backgroundColor: '#0f1218',
    title: 'VetTV Vintage PC',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow?.show())

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpc(): void {
  ipcMain.handle('settings:get', () => {
    ensureMachinesRoot()
    return {
      romFolder: store.get('romFolder') || '',
      eightySixBoxPath: store.get('eightySixBoxPath') || '',
      machinesRoot: getMachinesRoot(),
      firstRunComplete: Boolean(store.get('firstRunComplete'))
    } satisfies AppSettings
  })

  ipcMain.handle('settings:set', (_e, partial: Partial<AppSettings>) => {
    if (partial.romFolder !== undefined) store.set('romFolder', partial.romFolder)
    if (partial.eightySixBoxPath !== undefined)
      store.set('eightySixBoxPath', partial.eightySixBoxPath)
    if (partial.machinesRoot !== undefined) {
      store.set('machinesRoot', partial.machinesRoot)
      if (partial.machinesRoot && !existsSync(partial.machinesRoot)) {
        mkdirSync(partial.machinesRoot, { recursive: true })
      }
    }
    if (partial.firstRunComplete !== undefined)
      store.set('firstRunComplete', partial.firstRunComplete)
    return {
      romFolder: store.get('romFolder') || '',
      eightySixBoxPath: store.get('eightySixBoxPath') || '',
      machinesRoot: getMachinesRoot(),
      firstRunComplete: Boolean(store.get('firstRunComplete'))
    }
  })

  ipcMain.handle('dialog:pickFolder', async (_e, title?: string) => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: title || 'Select folder',
      properties: ['openDirectory', 'createDirectory']
    })
    if (result.canceled || !result.filePaths[0]) return null
    return result.filePaths[0]
  })

  ipcMain.handle('dialog:pickFile', async (_e, filters?: Electron.FileFilter[]) => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: 'Select file',
      properties: ['openFile'],
      filters: filters || [{ name: 'ISO images', extensions: ['iso'] }]
    })
    if (result.canceled || !result.filePaths[0]) return null
    return result.filePaths[0]
  })

  ipcMain.handle('dialog:pickBinary', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: 'Select 86Box binary',
      properties: ['openFile'],
      filters:
        process.platform === 'win32'
          ? [{ name: 'Executable', extensions: ['exe'] }]
          : [{ name: 'All files', extensions: ['*'] }]
    })
    if (result.canceled || !result.filePaths[0]) return null
    return result.filePaths[0]
  })

  ipcMain.handle('machines:list', () => listMachines())

  ipcMain.handle('machines:get', (_e, id: string) => {
    return listMachines().find((m) => m.id === id) || null
  })

  ipcMain.handle(
    'machines:create',
    (
      _e,
      input: {
        name: string
        era: GuestEra
        diskSizeGb: number
        isoPath: string | null
      }
    ) => {
      const root = ensureMachinesRoot()
      const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
      const folderName = `${slugify(input.name)}-${id.slice(0, 6)}`
      const machineDir = join(root, folderName)
      mkdirSync(machineDir, { recursive: true })

      const preset = loadPreset(input.era)
      const meta: MachineMeta = {
        id,
        name: input.name.trim() || `${input.era} machine`,
        era: input.era,
        createdAt: new Date().toISOString(),
        lastPlayedAt: null,
        diskSizeGb: input.diskSizeGb,
        isoPath: input.isoPath,
        presetId: String(preset.id || input.era),
        folderName
      }

      writeFileSync(join(machineDir, 'machine.json'), JSON.stringify(meta, null, 2), 'utf-8')

      // Disk placeholder — real sparse VHD/IMG creation stubbed for MVP.
      // README documents that 86Box expects a real image; placeholder marks intent.
      const diskNote = `VetTV Vintage PC disk placeholder
Machine: ${meta.name}
Requested size: ${meta.diskSizeGb} GB
Status: STUB — replace with a real disk image created by 86Box or qemu-img.
This file is intentionally empty of guest data.
`
      writeFileSync(join(machineDir, 'disk.img.placeholder'), diskNote, 'utf-8')
      // Zero-byte stub so path exists for config reference
      writeFileSync(join(machineDir, 'disk.img'), Buffer.alloc(0))

      writeEightySixBoxConfig(machineDir, meta, preset)

      writeFileSync(
        join(machineDir, 'README.txt'),
        `Machine data folder for "${meta.name}"
Era: ${meta.era}
Created: ${meta.createdAt}

Files:
- machine.json — VetTV metadata
- 86box.cfg — 86Box config stub (refine against your pinned 86Box version)
- disk.img — PLACEHOLDER (0 bytes). Create a real hard disk image with 86Box
  or qemu-img before expecting a bootable install. See app README.
- disk.img.placeholder — explains the stub

BYO: provide your own OS ISO and BIOS/ROMs. VetTV does not ship them.
`,
        'utf-8'
      )

      return {
        ...meta,
        folderPath: machineDir,
        status: computeStatus(meta)
      }
    }
  )

  ipcMain.handle('machines:setIso', (_e, id: string, isoPath: string | null) => {
    const card = listMachines().find((m) => m.id === id)
    if (!card) throw new Error('Machine not found')
    const metaPath = join(card.folderPath, 'machine.json')
    const meta = JSON.parse(readFileSync(metaPath, 'utf-8')) as MachineMeta
    meta.isoPath = isoPath
    writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8')
    const preset = loadPreset(meta.era)
    writeEightySixBoxConfig(card.folderPath, meta, preset)
    return { ...meta, folderPath: card.folderPath, status: computeStatus(meta) }
  })

  ipcMain.handle('machines:delete', (_e, id: string) => {
    const card = listMachines().find((m) => m.id === id)
    if (!card) throw new Error('Machine not found')
    const proc = running.get(id)
    if (proc) {
      try {
        proc.kill()
      } catch {
        /* ignore */
      }
      running.delete(id)
    }
    rmSync(card.folderPath, { recursive: true, force: true })
    return true
  })

  ipcMain.handle('machines:openFolder', async (_e, id: string) => {
    const card = listMachines().find((m) => m.id === id)
    if (!card) throw new Error('Machine not found')
    await shell.openPath(card.folderPath)
    return true
  })

  ipcMain.handle('machines:start', async (_e, id: string) => {
    const card = listMachines().find((m) => m.id === id)
    if (!card) {
      return { ok: false as const, error: 'Machine not found.' }
    }

    const bin = store.get('eightySixBoxPath') || ''
    if (!bin || !existsSync(bin)) {
      return {
        ok: false as const,
        error:
          '86Box binary not set or missing. Open Settings and choose your 86Box executable path.'
      }
    }

    if (!romsPresent(store.get('romFolder') || '')) {
      return {
        ok: false as const,
        error:
          'BIOS/ROM folder is empty or unset. Add your own ROM files in Settings — VetTV never ships BIOS dumps.'
      }
    }

    if (!card.isoPath || !existsSync(card.isoPath)) {
      return {
        ok: false as const,
        error: 'No OS ISO attached (or path missing). Use Change ISO to select an ISO you own.'
      }
    }

    const cfg = join(card.folderPath, '86box.cfg')
    if (!existsSync(cfg)) {
      return { ok: false as const, error: '86box.cfg missing from machine folder.' }
    }

    if (running.has(id)) {
      return { ok: false as const, error: 'This machine already appears to be running.' }
    }

    try {
      // Spawn unmodified 86Box. Flags vary; -C / --config commonly accepted.
      // Also set cwd to machine folder so relative paths resolve.
      const child = spawn(bin, ['-C', cfg], {
        cwd: card.folderPath,
        detached: false,
        stdio: 'ignore'
      })
      running.set(id, child)
      child.on('exit', () => running.delete(id))
      child.on('error', () => running.delete(id))

      const metaPath = join(card.folderPath, 'machine.json')
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8')) as MachineMeta
      meta.lastPlayedAt = new Date().toISOString()
      writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8')

      return { ok: true as const }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return { ok: false as const, error: `Failed to spawn 86Box: ${message}` }
    }
  })

  ipcMain.handle('presets:list', () => {
    const eras: GuestEra[] = ['win95', 'win98se', 'win2000']
    return eras.map((era) => loadPreset(era))
  })

  ipcMain.handle('app:getVersion', () => app.getVersion())

  ipcMain.handle('shell:openExternal', (_e, url: string) => {
    // Only allow known doc URLs
    if (
      url.startsWith('https://86box.net') ||
      url.startsWith('https://github.com/86Box/') ||
      url.startsWith('https://github.com/Vet-TV/')
    ) {
      return shell.openExternal(url)
    }
    return Promise.reject(new Error('URL not allowed'))
  })

  ipcMain.handle('roms:check', () => {
    const folder = store.get('romFolder') || ''
    return { folder, present: romsPresent(folder) }
  })
}

app.whenReady().then(() => {
  ensureMachinesRoot()
  registerIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
