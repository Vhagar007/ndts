import { createClient } from '@supabase/supabase-js'

// Replace these with your Supabase project values after setup
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const OFFICES = ['Bhiwandi', 'Vasai', 'Bhayandar', 'Dongri', 'Vapi']

export const STATUS_LABEL = {
  booked: 'Booked',
  transit: 'In transit',
  arrived: 'Arrived Ahmedabad',
  delivered: 'Delivered',
}

export const STATUS_COLOR = {
  booked: '#854F0B',
  transit: '#185FA5',
  arrived: '#0F6E56',
  delivered: '#5F5E5A',
}

export const STATUS_BG = {
  booked: '#FAEEDA',
  transit: '#E6F1FB',
  arrived: '#E1F5EE',
  delivered: '#F1EFE8',
}

export function fmtDate(s) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fmtDT(s) {
  if (!s) return 'Pending'
  const d = new Date(s)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) +
    ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}
