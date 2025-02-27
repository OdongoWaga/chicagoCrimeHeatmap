'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import 'leaflet.heat'
import { useIncidents } from '@/hooks/useIncidents'

declare module 'leaflet' {
  export function heatLayer(latlngs: [number, number, number][], options?: any): any
}

function HeatmapLayer({ data }: { data: [number, number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    const heat = L.heatLayer(data, { 
      radius: 25,
      blur: 15,
      maxZoom: 15,
      max: 1.0,
      gradient: {
        0.4: 'blue',
        0.6: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    }).addTo(map)

    return () => {
      map.removeLayer(heat)
    }
  }, [map, data])

  return null
}

export default function CrimeMap() {
  const { data: incidents, isLoading } = useIncidents()
  const [heatmapData, setHeatmapData] = useState<[number, number, number][]>([])

  // Initialize Leaflet icons
  useEffect(() => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/marker-icon-2x.png',
      iconUrl: '/marker-icon.png',
      shadowUrl: '/marker-shadow.png',
    })
  }, [])

  useEffect(() => {
    if (!incidents) return
    
    const points: [number, number, number][] = incidents.map(incident => [
      incident.latitude,
      incident.longitude,
      1 // weight of each point
    ])
    
    setHeatmapData(points)
  }, [incidents])

  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center">Loading map data...</div>
  }

  return (
    <div className="w-full h-full" style={{ position: 'relative' }}>
      <MapContainer
        center={[41.8781, -87.6298]}
        zoom={11}
        style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0 }}
        attributionControl={false} // Disable attribution to avoid COEP issues
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          crossOrigin="anonymous" // Add crossOrigin attribute
        />
        <HeatmapLayer data={heatmapData} />
      </MapContainer>
    </div>
  )
}