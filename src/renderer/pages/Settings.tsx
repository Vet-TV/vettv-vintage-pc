import { useState } from 'react'
import type { AppSettings } from '@shared/types'
import LegalStrip from '../components/LegalStrip'

export default function SettingsPage({
  settings,
  onChange
}: {
  settings: AppSettings
  onChange: () => Promise<void>
}) {
  const [romFolder, setRomFolder] = useState(settings.romFolder)
  const [eightySixBoxPath, setEightySixBoxPath] = useState(settings.eightySixBoxPath)
  const [machinesRoot, setMachinesRoot] = useState(settings.machinesRoot)
  const [saved, setSaved] = useState(false)

  const save = async (partial: Partial<AppSettings>) => {
    const next = await window.vettv.setSettings(partial)
    setRomFolder(next.romFolder)
    setEightySixBoxPath(next.eightySixBoxPath)
    setMachinesRoot(next.machinesRoot)
    setSaved(true)
    await onChange()
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div>
      <h1>Settings</h1>
      <p className="lede">Paths for 86Box, BIOS files you supply, and machine storage.</p>
      <LegalStrip />

      <div className="panel">
        <div className="field">
          <label>ROM / BIOS folder</label>
          <p className="hint">
            Heuristic: folder must exist and be non-empty (or contain a .rom / .bin file). We never
            download ROMs. See upstream 86Box docs for filenames.
          </p>
          <div className="path-row">
            <input type="text" readOnly value={romFolder} />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={async () => {
                const path = await window.vettv.pickFolder('Select BIOS / ROM folder')
                if (path) await save({ romFolder: path })
              }}
            >
              Browse…
            </button>
          </div>
        </div>

        <div className="field">
          <label>86Box binary</label>
          <p className="hint">Unmodified upstream build preferred. Spawned as a separate process.</p>
          <div className="path-row">
            <input type="text" readOnly value={eightySixBoxPath} />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={async () => {
                const path = await window.vettv.pickBinary()
                if (path) await save({ eightySixBoxPath: path })
              }}
            >
              Browse…
            </button>
          </div>
        </div>

        <div className="field">
          <label>Machines root</label>
          <p className="hint">Each machine gets a subfolder with machine.json, 86box.cfg, and disk stub.</p>
          <div className="path-row">
            <input type="text" readOnly value={machinesRoot} />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={async () => {
                const path = await window.vettv.pickFolder('Select machines root folder')
                if (path) await save({ machinesRoot: path })
              }}
            >
              Browse…
            </button>
          </div>
        </div>

        {saved && <p className="meta">Saved.</p>}
      </div>
    </div>
  )
}
