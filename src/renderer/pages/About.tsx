import { useEffect, useState } from 'react'
import LegalStrip from '../components/LegalStrip'

export default function About() {
  const [version, setVersion] = useState('…')

  useEffect(() => {
    window.vettv.getVersion().then(setVersion)
  }, [])

  return (
    <div>
      <h1>About</h1>
      <LegalStrip />
      <div className="panel">
        <dl className="kv">
          <dt>App</dt>
          <dd>VetTV Vintage PC</dd>
          <dt>Version</dt>
          <dd>{version} (MVP empty shell)</dd>
          <dt>Engine</dt>
          <dd>86Box (spawned unmodified; not bundled in this MVP)</dd>
          <dt>Brand</dt>
          <dd>VetTV / VetTV Studios — not affiliated with Microsoft</dd>
        </dl>
        <p className="lede" style={{ marginTop: 16 }}>
          Runs classic PC OS images and games <strong>you own</strong>. We sell setup quality —
          sound profiles, keyboard/mouse, controller/handheld affordances — not Windows itself.
        </p>
        <div className="btn-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.vettv.openExternal('https://github.com/86Box/86Box')}
          >
            86Box on GitHub
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.vettv.openExternal('https://86box.net/')}
          >
            86Box website
          </button>
        </div>
        <p className="meta" style={{ marginTop: 16 }}>
          Third-party licenses: see <code>THIRD_PARTY_NOTICES.md</code> in the repository.
        </p>
      </div>
    </div>
  )
}
