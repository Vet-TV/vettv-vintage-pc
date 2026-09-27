import { contextBridge, ipcRenderer } from 'electron'
import type { AppSettings, GuestEra, MachineCard, VetTvApi } from '../shared/types'

const api: VetTvApi = {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (partial) => ipcRenderer.invoke('settings:set', partial),
  pickFolder: (title) => ipcRenderer.invoke('dialog:pickFolder', title),
  pickIso: () =>
    ipcRenderer.invoke('dialog:pickFile', [{ name: 'ISO images', extensions: ['iso'] }]),
  pickBinary: () => ipcRenderer.invoke('dialog:pickBinary'),
  listMachines: () => ipcRenderer.invoke('machines:list'),
  getMachine: (id) => ipcRenderer.invoke('machines:get', id),
  createMachine: (input) => ipcRenderer.invoke('machines:create', input),
  setMachineIso: (id, isoPath) => ipcRenderer.invoke('machines:setIso', id, isoPath),
  deleteMachine: (id) => ipcRenderer.invoke('machines:delete', id),
  openMachineFolder: (id) => ipcRenderer.invoke('machines:openFolder', id),
  startMachine: (id) => ipcRenderer.invoke('machines:start', id),
  listPresets: () => ipcRenderer.invoke('presets:list'),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  checkRoms: () => ipcRenderer.invoke('roms:check')
}

contextBridge.exposeInMainWorld('vettv', api)

export type { AppSettings, GuestEra, MachineCard, VetTvApi }
