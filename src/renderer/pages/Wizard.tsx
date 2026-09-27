import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GuestEra } from '@shared/types'
import LegalStrip from '../components/LegalStrip'
import { ERA_OPTIONS } from '../lib/era'

const DISK_PRESETS = [2, 8, 20]

export default function Wizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [era, setEra] = useState<GuestEra | null>(null)
  const [name, setName] = useState('')
  const [diskSizeGb, setDiskSizeGb] = useState(8)
  const [customDisk, setCustomDisk] = useState(false)
  const [isoPath, setIsoPath] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultName = useMemo(() => {
    if (!era) return ''
    const label = ERA_OPTIONS.find((e) => e.id === era)?.title || era
    const d = new Date()
    const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return `${label} · ${stamp}`
  }, [era])

  const pickIso = async () => {
    const path = await window.vettv.pickIso()
    if (path) setIsoPath(path)
  }

  const create = async () => {
    if (!era) return
    setBusy(true)
    setError(null)
    try {
      const machine = await window.vettv.createMachine({
        name: name.trim() || defaultName,
        era,
        diskSizeGb,
        isoPath
      })
      navigate(`/machine/${machine.id}`, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  return (
    <div>
      <h1>New machine</h1>
      <p className="lede">Four steps. No account. Bring your own Windows install image.</p>
      <LegalStrip />

      <div className="steps">
        {['Guest era', 'Name & disk', 'OS ISO', 'Review'].map((label, i) => (
          <span key={label} className={`step-pill ${step === i ? 'active' : ''}`}>
            {i + 1}. {label}
          </span>
        ))}
      </div>

      {step === 0 && (
        <div className="panel">
          <h2>Choose guest era</h2>
          <p className="hint" style={{ color: 'var(--muted)', marginTop: 0 }}>
            DOS-only titles come later (DOSBox-X). This wizard is for Windows 9x / 2000 on 86Box.
          </p>
          <div className="choice-grid">
            {ERA_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`choice ${era === opt.id ? 'selected' : ''}`}
                onClick={() => {
                  setEra(opt.id)
                  if (!name) setName('')
                }}
              >
                <strong>
                  {opt.title}
                  {opt.experimental ? ' · experimental' : ''}
                </strong>
                <span>{opt.blurb}</span>
              </button>
            ))}
          </div>
          <div className="btn-row">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!era}
              onClick={() => {
                setName((n) => n || defaultName)
                setStep(1)
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="panel">
          <h2>Name & disk size</h2>
          <div className="field">
            <label htmlFor="machine-name">Machine name</label>
            <input
              id="machine-name"
              type="text"
              value={name || defaultName}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Disk size</label>
            <p className="hint">
              MVP writes a placeholder disk image. Create a real image with 86Box or qemu-img
              before install (see machine folder README).
            </p>
            <div className="btn-row" style={{ marginTop: 0 }}>
              {DISK_PRESETS.map((gb) => (
                <button
                  key={gb}
                  type="button"
                  className={`btn ${!customDisk && diskSizeGb === gb ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setCustomDisk(false)
                    setDiskSizeGb(gb)
                  }}
                >
                  {gb} GB
                </button>
              ))}
              <button
                type="button"
                className={`btn ${customDisk ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCustomDisk(true)}
              >
                Custom
              </button>
            </div>
            {customDisk && (
              <input
                type="number"
                min={1}
                max={128}
                value={diskSizeGb}
                onChange={(e) => setDiskSizeGb(Math.max(1, Number(e.target.value) || 1))}
                style={{ marginTop: 10, maxWidth: 160 }}
              />
            )}
          </div>
          <div className="btn-row">
            <button type="button" className="btn btn-secondary" onClick={() => setStep(0)}>
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="panel">
          <h2>Select your Windows install image</h2>
          <p className="hint" style={{ color: 'var(--muted)' }}>
            Use an ISO you own. VetTV does not provide Windows. Keep install media you already
            have on disk — we never fetch an ISO for you.
          </p>
          <div className="field">
            <label>ISO path</label>
            <div className="path-row">
              <input
                type="text"
                readOnly
                value={isoPath || ''}
                placeholder="Optional — skip to create with Needs ISO status"
              />
              <button type="button" className="btn btn-secondary" onClick={pickIso}>
                Browse…
              </button>
              {isoPath && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsoPath(null)}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="btn-row">
            <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && era && (
        <div className="panel">
          <h2>Review & create</h2>
          <dl className="kv">
            <dt>Era</dt>
            <dd>{ERA_OPTIONS.find((e) => e.id === era)?.title}</dd>
            <dt>Name</dt>
            <dd>{name.trim() || defaultName}</dd>
            <dt>Disk</dt>
            <dd>{diskSizeGb} GB (placeholder image in MVP)</dd>
            <dt>Sound profile</dt>
            <dd>{era === 'win2000' ? 'es1371' : 'sb16'}</dd>
            <dt>ISO</dt>
            <dd>{isoPath || 'Not attached — status will be Needs ISO'}</dd>
          </dl>
          {error && <div className="error-box">{error}</div>}
          <div className="btn-row">
            <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
              Back
            </button>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={create}>
              Create machine
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
