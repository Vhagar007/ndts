import { useState } from 'react'

// Office credentials — change these passwords as needed
const CREDENTIALS = {
  Bhiwandi:   'bhiwandi123',
  Vasai:      'vasai123',
  Bhayandar:  'bhayandar123',
  Dongri:     'dongri123',
  Vapi:       'vapi123',
  Ahmedabad:  'amd123',
  Admin:      'ndts@admin',
}

export default function Login({ onLogin }) {
  const [office, setOffice] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleLogin() {
    if (!office) { setError('Please select an office.'); return }
    if (!password) { setError('Please enter a password.'); return }
    if (CREDENTIALS[office] === password) {
      const role = office === 'Admin' ? 'admin' : office === 'Ahmedabad' ? 'ahmedabad' : 'office'
      onLogin({ office, role })
      setError('')
    } else {
      setError('Incorrect password. Please try again.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>Welcome to</p>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>New Diamond Transport</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>Sign in to your office account</p>
        </div>

        <div className="card">
          <div className="fg">
            <label>Office / Location</label>
            <select value={office} onChange={e => { setOffice(e.target.value); setError('') }}>
              <option value="">— select your office —</option>
              <optgroup label="Booking Offices">
                <option>Bhiwandi</option>
                <option>Vasai</option>
                <option>Bhayandar</option>
                <option>Dongri</option>
                <option>Vapi</option>
              </optgroup>
              <optgroup label="Head Office">
                <option>Ahmedabad</option>
              </optgroup>
              <optgroup label="Management">
                <option>Admin</option>
              </optgroup>
            </select>
          </div>
          <div className="fg">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="Enter password"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          {error && <p className="msg-error" style={{ marginBottom: 12 }}>{error}</p>}
          <button className="btn btn-primary btn-full" onClick={handleLogin}>
            Sign in →
          </button>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', marginTop: '1.5rem' }}>
          New Diamond Transport Service · Ahmedabad<br />
          7878548055 · 9512614040
        </p>
      </div>
    </div>
  )
}
