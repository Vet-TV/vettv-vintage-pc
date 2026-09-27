import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { MachineCard } from '@shared/types'
import LegalStrip from '../components/LegalStrip'
import StatusBadge from '../components/StatusBadge'
import { eraLabel } from '../lib/era'

export default function Home() {
  const [machines, setMachines] = useState<MachineCard[]>([])
  const [romOk, setRomOk] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      setMachines(await window.vettv.listMachines())
      const roms = await window.vettv.checkRoms()
      setRomOk(roms.present)
    })()
  }, [])

  return (
    <div>
      <h1>Machine library</h1>
      <p className="lede">Create a guided 86Box machine and attach an OS ISO you own.</p>
      <LegalStrip />

      {!romOk && (
        <div className="error-box">
          BIOS/ROM folder is unset or empty. Machines will show <strong>Needs BIOS files</strong>{' '}
          until you add ROMs in Settings. VetTV never downloads them.
        </div>
      )}

      <div className="btn-row" style={{ marginTop: 0, marginBottom: 20 }}>
        <Link className="btn btn-primary" to="/new">
          {machines.length === 0 ? 'Create your first machine' : 'New machine'}
        </Link>
        <Link className="btn btn-secondary" to="/settings">
          Settings
        </Link>
      </div>

      {machines.length === 0 ? (
        <div className="empty">
          <h2>No machines yet</h2>
          <p className="lede" style={{ marginBottom: 16 }}>
            Start with a Windows 95 / 98SE / 2000 profile. DOSBox-X titles come later.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/new')}>
            Create your first machine
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {machines.map((m) => (
            <button
              key={m.id}
              type="button"
              className="card"
              onClick={() => navigate(`/machine/${m.id}`)}
            >
              <span className="badge badge-era">{eraLabel(m.era)}</span>
              <h3>{m.name}</h3>
              <StatusBadge status={m.status} />
              <span className="meta">
                {m.lastPlayedAt
                  ? `Last played ${new Date(m.lastPlayedAt).toLocaleString()}`
                  : `Created ${new Date(m.createdAt).toLocaleString()}`}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
