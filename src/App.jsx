import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import './index.css'
import NewLR from './pages/NewLR'
import Dispatch from './pages/Dispatch'
import Ahmedabad from './pages/Ahmedabad'
import Track from './pages/Track'
import Dashboard from './pages/Dashboard'

function Nav() {
  const loc = useLocation()
  const isTrack = loc.pathname.startsWith('/track')
  if (isTrack) return null
  return (
    <nav className="topnav no-print">
      <a className="topnav-brand" href="/">New <span>Diamond</span> Transport</a>
      <NavLink className={({isActive})=>'nav-link'+(isActive?' active':'')} to="/new-lr">New LR</NavLink>
      <NavLink className={({isActive})=>'nav-link'+(isActive?' active':'')} to="/dispatch">Dispatch</NavLink>
      <NavLink className={({isActive})=>'nav-link'+(isActive?' active':'')} to="/ahmedabad">Ahmedabad</NavLink>
      <NavLink className={({isActive})=>'nav-link'+(isActive?' active':'')} to="/dashboard">Dashboard</NavLink>
      <div className="nav-right">
        <NavLink className="btn btn-sm btn-blue no-print" to="/track">Track parcel</NavLink>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new-lr" element={<NewLR />} />
        <Route path="/dispatch" element={<Dispatch />} />
        <Route path="/ahmedabad" element={<Ahmedabad />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/track" element={<Track />} />
        <Route path="/track/:office/:lr" element={<Track />} />
      </Routes>
    </BrowserRouter>
  )
}
