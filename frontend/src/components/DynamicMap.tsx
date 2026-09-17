'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Submission } from '@/lib/mockData'

// Fix missing marker icons due to next.js pathing
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface DynamicMapProps {
  submissions: Submission[]
}

const JHARKHAND_CENTER: [number, number] = [23.6102, 85.2799]

export default function DynamicMap({ submissions }: DynamicMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div style={{ width: '100%', height: '100%', background: 'var(--warm-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>

  // Create a custom icon for pins based on urgency
  const createCustomIcon = (isHighUrgency: boolean) => {
    const color = isHighUrgency ? '#ef4444' : '#3b82f6' // Bright Red and Bright Blue
    return L.divIcon({
      className: 'custom-leaflet-icon',
      html: `<div style="
        background-color: ${color};
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -8]
    })
  }

  return (
    <MapContainer 
      center={JHARKHAND_CENTER} 
      zoom={7} 
      style={{ width: '100%', minHeight: '400px', height: '100%', borderRadius: 'var(--radius-md)', zIndex: 1 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {submissions.map(s => {
        if (!s.lat || !s.lng) return null
        const isHigh = s.urgencyScore >= 85
        
        return (
          <Marker 
            key={s.id} 
            position={[s.lat, s.lng]} 
            icon={createCustomIcon(isHigh)}
          >
            <Popup>
              <div style={{ padding: '4px', maxWidth: '200px' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--cf-800)' }}>{s.title}</h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>{s.district}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className="badge badge-submitted" style={{ padding: '2px 6px', fontSize: '10px' }}>{s.status}</span>
                  <span style={{ fontSize: '10px', color: 'var(--ai-600)', fontWeight: 'bold' }}>{s.endorsements} endorsements</span>
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
