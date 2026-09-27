export type GuestEra = 'win95' | 'win98se' | 'win2000'

export type MachineStatus = 'Ready' | 'Needs ISO' | 'Needs ROMs'

export interface AppSettings {
  romFolder: string
  eightySixBoxPath: string
  machinesRoot: string
  firstRunComplete: boolean
}

export interface MachineCard {
  id: string
  name: string
  era: GuestEra
  createdAt: string
  lastPlayedAt: string | null
  diskSizeGb: number
  isoPath: string | null
  presetId: string
  folderName: string
  folderPath: string
  status: MachineStatus
}

export interface VetTvApi {
  getSettings: () => Promise<AppSettings>
  setSettings: (partial: Partial<AppSettings>) => Promise<AppSettings>
  pickFolder: (title?: string) => Promise<string | null>
  pickIso: () => Promise<string | null>
  pickBinary: () => Promise<string | null>
  listMachines: () => Promise<MachineCard[]>
  getMachine: (id: string) => Promise<MachineCard | null>
  createMachine: (input: {
    name: string
    era: GuestEra
    diskSizeGb: number
    isoPath: string | null
  }) => Promise<MachineCard>
  setMachineIso: (id: string, isoPath: string | null) => Promise<MachineCard>
  deleteMachine: (id: string) => Promise<boolean>
  openMachineFolder: (id: string) => Promise<boolean>
  startMachine: (id: string) => Promise<{ ok: true } | { ok: false; error: string }>
  listPresets: () => Promise<Record<string, unknown>[]>
  getVersion: () => Promise<string>
  openExternal: (url: string) => Promise<void>
  checkRoms: () => Promise<{ folder: string; present: boolean }>
}
