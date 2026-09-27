import { useState } from 'react'
import type { AppSettings } from '@shared/types'
import LegalStrip from '../components/LegalStrip'

export default function FirstRun({
  settings,
  onDone
}: {
  settings: AppSettings
  onDone: () => Promise<void>
}) {
  const [romFolder, setRomFolder] = useState(settings.romFolder)
  const [eightySixBoxPath, setEightySixBoxPath] = useState(settings.eightySixBoxPath)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pickRom = async () => {
    const path = await window.vettv.pickFolder('Select BIOS / ROM folder')
    if (path) setRomFolder(path)
  }

  const pickBin = async () => {
    const path = await window.vettv.pickBinary()
    if (path) setEightySixBoxPath(path)
  }

  const finish = async (deferRoms: boolean) => {
    setBusy(true)
    setError(null)
    try {
      if (!deferRoms && !romFolder) {
        setError('Add your BIOS folder to continue, or continue with a warning on Home.')
        setBusy(false)
        return
      }
      await window.vettv.setSettings({
        romFolder,
        eightySixBoxPath,
        firstRunComplete: true
      })
      await onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  return (
    <div className="content" style={{ maxWidth: 640 }}>
      <h1>Welcome to VetTV Vintage PC</h1>
      <p className="lede">
        Your ISOs. Your games. We handle setup, sound profiles, and controls — wrapping 86Box for
        classic Windows 9x machines.
      </p>
      <LegalStrip />

      <div className="panel">
        <div className="field">
          <label>BIOS / ROM folder</label>
          <p className="hint">
            Add your BIOS folder to continue. We never ship BIOS files. See upstream 86Box
            documentation for required filenames — not third-party dump sites.
          </p>
          <div className="path-row">
            <input type="text" readOnly value={romFolder} placeholder="No folder selected" />
            <button type="button" className="btn btn-secondary" onClick={pickRom}>
              Browse…
            </button>
          </div>
        </div>

        <div className="field">
          <label>86Box binary (optional for now)</label>
          <p className="hint">
            Point at an unmodified 86Box build on this PC. You can set this later in Settings.
          </p>
          <div className="path-row">
            <input
              type="text"
              readOnly
              value={eightySixBoxPath}
              placeholder="Not set — Start will explain how to fix"
            />
            <button type="button" className="btn btn-secondary" onClick={pickBin}>
              Browse…
            </button>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="btn-row">
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={() => finish(false)}
          >
            Continue
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={busy}
            onClick={() => finish(true)}
          >
            Skip ROMs for now
          </button>
        </div>
      </div>
    </div>
  )
}
