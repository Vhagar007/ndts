import { useState, useRef, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate, useNavigate } from 'react-router-dom'
import './index.css'
import Login from './pages/Login'
import LRManager from './pages/LRManager'
import OfficeDashboard from './pages/OfficeDashboard'
import Ahmedabad from './pages/Ahmedabad'
import Track from './pages/Track'
import Dashboard from './pages/Dashboard'

function NavDropdown({ label, items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const loc = useLocation()

  // close on outside click
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isActive = items.some(item => loc.pathname === item.path || loc.search.includes(item.view))

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className={'nav-link' + (isActive ? ' active' : '')}
        style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, background: 'none', padding: '14px 14px' }}
      >
        {label}
        <span style={{ fontSize: 8, opacity: 0.6, marginTop: 1 }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0,
          background: 'var(--bg)', border: '0.5px solid var(--border2)',
          borderRadius: 'var(--radius-lg)', boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
          zIndex: 200, minWidth: 180, overflow: 'hidden'
        }}>
          {items.map((item, i) => (
            <button key={i}
              onClick={() => { navigate(item.path); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 16px', textAlign: 'left',
                border: 'none', borderBottom: i < items.length - 1 ? '0.5px solid var(--border)' : 'none',
                background: (loc.pathname === item.path) ? 'var(--bg2)' : 'transparent',
                fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                color: 'var(--text)', fontWeight: (loc.pathname === item.path) ? 500 : 400,
              }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 500 }}>{item.label}</div>
                {item.desc && <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>{item.desc}</div>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Nav({ user, onLogout }) {
  const loc = useLocation()
  if (loc.pathname.startsWith('/track')) return null
  const isOffice = user.role === 'office'
  const isAhmedabad = user.role === 'ahmedabad'
  const isAdmin = user.role === 'admin'

  const lrItems = [
    { icon: '➕', label: 'New LR',    desc: 'Create a new entry',         path: '/lr/new' },
    { icon: '✏️', label: 'Edit LR',   desc: 'Update an existing LR',      path: '/lr/edit' },
    { icon: '🗑', label: 'Delete LR', desc: 'Remove a wrong entry',       path: '/lr/delete' },
    { icon: '🔍', label: 'Search LR', desc: 'Look up status and details', path: '/lr/search' },
  ]

  const dispatchItems = [
    { icon: '🚚', label: 'New dispatch',     desc: 'Dispatch a truck & create invoice', path: '/dispatch/new' },
    { icon: '📋', label: 'Dispatch history', desc: 'View past invoices',                path: '/dispatch/history' },
  ]

  return (
    <nav className="topnav no-print">
      <a className="topnav-brand" href="/">New <span>Diamond</span></a>
      {(isOffice || isAdmin) && (
        <NavLink className={({isActive})=>'nav-link'+(isActive?' active':'')} to="/office">Dashboard</NavLink>
      )}
      {(isOffice || isAdmin) && <NavDropdown label="LR" items={lrItems} />}
      {(isOffice || isAdmin) && <NavDropdown label="Dispatch" items={dispatchItems} />}
      {(isAhmedabad || isAdmin) && (
        <NavLink className={({isActive})=>'nav-link'+(isActive?' active':'')} to="/ahmedabad">Ahmedabad</NavLink>
      )}
      {isAdmin && (
        <NavLink className={({isActive})=>'nav-link'+(isActive?' active':'')} to="/dashboard">All offices</NavLink>
      )}
      <div className="nav-right">
        <span style={{ fontSize: 12, color: 'var(--text2)', marginRight: 8 }}>{user.office}</span>
        <NavLink className="btn btn-sm btn-blue no-print" to="/track">Track</NavLink>
        <button className="btn btn-sm no-print" style={{ marginLeft: 4 }} onClick={onLogout}>Sign out</button>
      </div>
    </nav>
  )
}

function DefaultRedirect({ user }) {
  if (user.role === 'office') return <Navigate to="/office" replace />
  if (user.role === 'ahmedabad') return <Navigate to="/ahmedabad" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('ndts_user')
    return saved ? JSON.parse(saved) : null
  })

  function handleLogin(u) { setUser(u); sessionStorage.setItem('ndts_user', JSON.stringify(u)) }
  function handleLogout() { setUser(null); sessionStorage.removeItem('ndts_user') }

  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/track')) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/track" element={<Track />} />
          <Route path="/track/:office/:lr" element={<Track />} />
        </Routes>
      </BrowserRouter>
    )
  }

  if (!user) return <Login onLogin={handleLogin} />

  return (
    <BrowserRouter>
      <Nav user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<DefaultRedirect user={user} />} />
        <Route path="/office" element={<OfficeDashboard user={user} />} />
        <Route path="/lr/:view" element={<LRManager user={user} />} />
        <Route path="/lr" element={<Navigate to="/lr/new" replace />} />
        <Route path="/dispatch/:view" element={<OfficeDashboard user={user} activeTab="dispatch" />} />
        <Route path="/dispatch" element={<Navigate to="/dispatch/new" replace />} />
        <Route path="/ahmedabad" element={<Ahmedabad user={user} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/track" element={<Track />} />
        <Route path="/track/:office/:lr" element={<Track />} />
      </Routes>
    </BrowserRouter>
  )
}
