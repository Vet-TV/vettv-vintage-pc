import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { MachineCard } from '@shared/types'
import StatusBadge from '../components/StatusBadge'
import { eraLabel } from '../lib/era'

export default function MachineDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [machine, setMachine] = useState<MachineCard | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const reload = async () => {
    if (!id) return
    const m = await window.vettv.getMachine(id)
    setMachine(m)
  }

  useEffect(() => {
    reload()
  }, [id])

  if (!machine) {
    return (
      <div>
        <p className="lede">Machine not found.</p>
        <Link className="btn btn-secondary" to="/">
          Back to library
        </Link>
      </div>
    )
  }

  const start = async () => {
    setBusy(true)
    setError(null)
    const result = await window.vettv.startMachine(machine.id)
    setBusy(false)
    if (!result.ok) setError(result.error)
    else await reload()
  }

  const changeIso = async () => {
    const path = await window.vettv.pickIso()
    if (!path) return
    setBusy(true)
    setError(null)
    try {
      const updated = await window.vettv.setMachineIso(machine.id, path)
      setMachine(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
    setBusy(false)
  }

  const clearIso = async () => {
    setBusy(true)
    const updated = await window.vettv.setMachineIso(machine.id, null)
    setMachine(updated)
    setBusy(false)
  }

  const openFolder = async () => {
    await window.vettv.openMachineFolder(machine.id)
  }

  const remove = async () => {
    const ok = window.confirm(
      `Delete machine “${machine.name}”? This removes the machine folder and placeholder disk from disk.`
    )
    if (!ok) return
    await window.vettv.deleteMachine(machine.id)
    navigate('/', { replace: true })
  }

  return (
    <div>
      <p className="meta">
        <Link to="/">← Machines</Link>
      </p>
      <h1>{machine.name}</h1>
      <div className="btn-row" style={{ marginTop: 0, marginBottom: 16 }}>
        <span className="badge badge-era">{eraLabel(machine.era)}</span>
        <StatusBadge status={machine.status} />
      </div>

      <div className="panel">
        <dl className="kv">
          <dt>Preset</dt>
          <dd>{machine.presetId}</dd>
          <dt>Disk size</dt>
          <dd>{machine.diskSizeGb} GB (placeholder image — see folder README)</dd>
          <dt>ISO</dt>
          <dd>{machine.isoPath || 'Not attached'}</dd>
          <dt>Data folder</dt>
          <dd>{machine.folderPath}</dd>
          <dt>Created</dt>
          <dd>{new Date(machine.createdAt).toLocaleString()}</dd>
          <dt>Last played</dt>
          <dd>
            {machine.lastPlayedAt
              ? new Date(machine.lastPlayedAt).toLocaleString()
              : 'Never'}
          </dd>
        </dl>

        {error && <div className="error-box">{error}</div>}

        <div className="btn-row">
          <button type="button" className="btn btn-primary" disabled={busy} onClick={start}>
            Start
          </button>
          <button type="button" className="btn btn-secondary" disabled={busy} onClick={changeIso}>
            Change ISO
          </button>
          {machine.isoPath && (
            <button type="button" className="btn btn-secondary" disabled={busy} onClick={clearIso}>
              Clear ISO
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={openFolder}>
            Open data folder
          </button>
        </div>

        <div className="danger-zone">
          <h2>Danger zone</h2>
          <p className="hint" style={{ color: 'var(--muted)' }}>
            Deletes this machine’s metadata, config stub, and placeholder disk from your machines
            root. Your original ISO is never deleted.
          </p>
          <button type="button" className="btn btn-danger" onClick={remove}>
            Delete machine
          </button>
        </div>
      </div>
    </div>
  )
}
