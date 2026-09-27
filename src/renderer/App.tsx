import { useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import type { AppSettings } from '@shared/types'
import FirstRun from './pages/FirstRun'
import Home from './pages/Home'
import Wizard from './pages/Wizard'
import MachineDetail from './pages/MachineDetail'
import SettingsPage from './pages/Settings'
import About from './pages/About'

export default function App() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshSettings = async () => {
    const s = await window.vettv.getSettings()
    setSettings(s)
    setLoading(false)
  }

  useEffect(() => {
    refreshSettings()
  }, [])

  if (loading || !settings) {
    return (
      <div className="content">
        <p className="lede">Loading…</p>
      </div>
    )
  }

  if (!settings.firstRunComplete) {
    return (
      <FirstRun
        settings={settings}
        onDone={async () => {
          await refreshSettings()
        }}
      />
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <strong>VetTV Vintage PC</strong>
          <span>BYO ISO · 86Box</span>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            Machines
          </NavLink>
          <NavLink to="/new">New machine</NavLink>
          <NavLink to="/settings">Settings</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new" element={<Wizard />} />
          <Route path="/machine/:id" element={<MachineDetail />} />
          <Route
            path="/settings"
            element={<SettingsPage settings={settings} onChange={refreshSettings} />}
          />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
