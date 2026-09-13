'use client'

import styles from './FilterBar.module.css'
import { Domain, SubmissionStatus } from '@/lib/mockData'

const JHARKHAND_DISTRICTS = [
  'All Districts', 'Ranchi', 'Dhanbad', 'Jamshedpur', 'Bokaro',
  'Hazaribagh', 'Deoghar', 'Giridih', 'Ramgarh', 'Latehar',
  'Gumla', 'Simdega', 'Khunti', 'West Singhbhum', 'Seraikela',
  'Pakur', 'Sahebganj', 'Dumka', 'Jamtara', 'Godda',
  'Palamu', 'Garhwa', 'Lohardaga', 'Chatra', 'Koderma',
]

const DOMAINS: string[] = [
  'All Domains', 'Education', 'Healthcare', 'Agriculture',
  'Water & Sanitation', 'Environment', 'Rural Livelihoods',
  'Accessibility', 'Urban Infrastructure', 'Public Service Delivery',
]

const STATUSES: string[] = [
  'All Statuses', 'Submitted', 'Under Review',
  'Assigned to Institution', 'In Progress', 'Pending Verification', 'Resolved',
]

export interface FilterState {
  search: string
  domain: string
  district: string
  status: string
}

interface FilterBarProps {
  filters: FilterState
  onChange: (f: FilterState) => void
  showStatus?: boolean
  showDomain?: boolean
  showDistrict?: boolean
}

export default function FilterBar({
  filters,
  onChange,
  showStatus = true,
  showDomain = true,
  showDistrict = true,
}: FilterBarProps) {
  function set(key: keyof FilterState, value: string) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className={styles.bar}>
      <input
        type="search"
        className={`form-input ${styles.search}`}
        placeholder="Search..."
        value={filters.search}
        onChange={(e) => set('search', e.target.value)}
        aria-label="Search submissions"
      />
      {showDomain && (
        <select
          className={`form-select ${styles.select}`}
          value={filters.domain}
          onChange={(e) => set('domain', e.target.value)}
          aria-label="Filter by domain"
        >
          {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      )}
      {showDistrict && (
        <select
          className={`form-select ${styles.select}`}
          value={filters.district}
          onChange={(e) => set('district', e.target.value)}
          aria-label="Filter by district"
        >
          {JHARKHAND_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      )}
      {showStatus && (
        <select
          className={`form-select ${styles.select}`}
          value={filters.status}
          onChange={(e) => set('status', e.target.value)}
          aria-label="Filter by status"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      )}
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => onChange({ search: '', domain: 'All Domains', district: 'All Districts', status: 'All Statuses' })}
      >
        Clear
      </button>
    </div>
  )
}

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  domain: 'All Domains',
  district: 'All Districts',
  status: 'All Statuses',
}

export function applyFilters<T extends { title?: string; domain?: string; district?: string; status?: string }>(
  items: T[],
  filters: FilterState
): T[] {
  return items.filter((item) => {
    const q = filters.search.toLowerCase()
    const matchSearch = !q || (item.title ?? '').toLowerCase().includes(q)
    const matchDomain = filters.domain === 'All Domains' || item.domain === filters.domain
    const matchDistrict = filters.district === 'All Districts' || item.district === filters.district
    const matchStatus = filters.status === 'All Statuses' || item.status === filters.status
    return matchSearch && matchDomain && matchDistrict && matchStatus
  })
}
