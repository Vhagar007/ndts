import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import './index.css'
import Login from './pages/Login'
import NewLR from './pages/NewLR'
import OfficeDashboard from './pages/OfficeDashboard'
import Ahmedabad from './pages/Ahmedabad'
import Track from './pages/Track'
import Dashboard from './pages/Dashboard'

function Nav({ user, onLogout }) {
  const loc = useLocation()
  if (loc.pathname.startsWith('/track')) return null
  const isOffice = user.role === 'office'
  const isAhmedabad = user.role === 'ahmedabad'
  const isAdmin = user.role === 'admin'

  return (
    <nav className="topnav no-print">
      <a className="topnav-brand" href="/">New <span>Diamond</span></a>
      {(isOffice || isAdmin) && <NavLink className={({isActive})=>'nav-link'+(isActive?' active':'')} to="/office">Dashboard</NavLink>}
      {(isOffice || isAdmin) && <NavLink className={({isActive})=>'nav-link'+(isActive?' active':'')} to="/new-lr">New LR</NavLink>}
      {(isOffice || isAdmin) && <NavLink className={({isActive})=>'nav-link'+(isActive?' active':'')} to="/dispatch">Dispatch</NavLink>}
      {(isAhmedabad || isAdmin) && <NavLink className={({isActive})=>'nav-link'+(isActive?' active':'')} to="/ahmedabad">Ahmedabad</NavLink>}
      {isAdmin && <NavLink className={({isActive})=>'nav-link'+(isActive?' active':'')} to="/dashboard">All offices</NavLink>}
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

  function handleLogin(userData) {
    setUser(userData)
    sessionStorage.setItem('ndts_user', JSON.stringify(userData))
  }

  function handleLogout() {
    setUser(null)
    sessionStorage.removeItem('ndts_user')
  }

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
        <Route path="/new-lr" element={<NewLR user={user} />} />
        <Route path="/dispatch" element={<OfficeDashboard user={user} />} />
        <Route path="/ahmedabad" element={<Ahmedabad user={user} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/track" element={<Track />} />
        <Route path="/track/:office/:lr" element={<Track />} />
      </Routes>
    </BrowserRouter>
  )
}
