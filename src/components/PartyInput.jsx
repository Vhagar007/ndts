import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function PartyInput({ label, nameValue, gstValue, onNameChange, onGstChange, placeholder = 'M/s. name', required = false }) {
  const [suggestions, setSuggestions] = useState([])
  const [showSug, setShowSug] = useState(false)
  const debouncedName = useDebounce(nameValue, 250)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!debouncedName || debouncedName.length < 2) { setSuggestions([]); return }
    async function fetchSuggestions() {
      const { data } = await supabase
        .from('lr_entries')
        .select('consignor, consignor_gst, consignee, consignee_gst')
        .or(`consignor.ilike.%${debouncedName}%,consignee.ilike.%${debouncedName}%`)
        .limit(30)
      if (!data) return
      const map = new Map()
      data.forEach(row => {
        ;[
          { name: row.consignor, gst: row.consignor_gst },
          { name: row.consignee, gst: row.consignee_gst },
        ].forEach(({ name, gst }) => {
          if (!name) return
          if (!name.toLowerCase().includes(debouncedName.toLowerCase())) return
          const key = name.trim().toLowerCase()
          if (!map.has(key)) map.set(key, { name: name.trim(), gst: gst || '' })
          else if (!map.get(key).gst && gst) map.get(key).gst = gst
        })
      })
      setSuggestions([...map.values()].slice(0, 7))
    }
    fetchSuggestions()
  }, [debouncedName])

  useEffect(() => {
    function handler(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowSug(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function selectSuggestion(party) {
    onNameChange(party.name)
    if (party.gst) onGstChange(party.gst)
    setShowSug(false)
    setSuggestions([])
  }

  return (
    <>
      <div className="fg" style={{ position: 'relative' }} ref={wrapRef}>
        <label>{label}{required && ' *'}</label>
        <input
          value={nameValue}
          onChange={e => { onNameChange(e.target.value); setShowSug(true) }}
          onFocus={() => suggestions.length > 0 && setShowSug(true)}
          placeholder={placeholder}
          autoComplete="off"
        />
        {showSug && suggestions.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 150,
            background: 'var(--bg)', border: '0.5px solid var(--border2)',
            borderRadius: 'var(--radius)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            maxHeight: 240, overflowY: 'auto'
          }}>
            {suggestions.map((s, i) => (
              <div key={i} onMouseDown={() => selectSuggestion(s)}
                style={{
                  padding: '8px 12px', cursor: 'pointer', fontSize: 13,
                  borderBottom: i < suggestions.length - 1 ? '0.5px solid var(--border)' : 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'background .1s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{s.name}</div>
                  {s.gst
                    ? <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>GST: {s.gst}</div>
                    : <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>No GST on record</div>
                  }
                </div>
                {s.gst
                  ? <span style={{ fontSize: 10, padding: '2px 7px', background: '#E1F5EE', color: '#0F6E56', borderRadius: 10, flexShrink: 0 }}>GST ✓</span>
                  : <span style={{ fontSize: 10, padding: '2px 7px', background: 'var(--bg2)', color: 'var(--text3)', borderRadius: 10, flexShrink: 0 }}>No GST</span>
                }
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="fg">
        <label>GST No.</label>
        <input value={gstValue} onChange={e => onGstChange(e.target.value)} placeholder="optional" />
      </div>
    </>
  )
}
