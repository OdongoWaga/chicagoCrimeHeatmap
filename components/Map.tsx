'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import 'leaflet.heat'
import { useIncidents } from '@/hooks/useIncidents' // Corrected import path

// Make sure leaflet.heat is properly typed
declare module 'leaflet' {
  export function heatLayer(latlngs: [number, number, number][], options?: any): any
}

function HeatmapLayer({ data }: { data: [number, number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !data.length) return

    console.log("Creating heatmap with data points:", data.length);
    
    // Remove any existing heatmap layers
    map.eachLayer(layer => {
      // Check if it's a heat layer by looking for specific properties
      if ((layer as any)._heat) {
        map.removeLayer(layer);
      }
    });

    const heat = L.heatLayer(data, { 
      radius: 5,
      blur: 10,
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
    if (!incidents || !incidents.length) return
    
    console.log("Processing incidents:", incidents.length);
    
    const points: [number, number, number][] = incidents
      .filter(incident => 
        // Simple check to ensure values are valid numbers
        !isNaN(incident.latitude) && 
        !isNaN(incident.longitude)
      )
      .map(incident => [
        incident.latitude,
        incident.longitude,
        1 // weight of each point
      ]);
    
    console.log("Valid heatmap points:", points.length);
    setHeatmapData(points);
  }, [incidents])

  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center">Loading map data...</div>
  }

  return (
    <div className="w-full h-full" style={{ position: 'relative' }}>
      <MapContainer
        center={[41.8781, -87.6298]} // Chicago coordinates
        zoom={11}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          crossOrigin="anonymous"
        />
        {heatmapData.length > 0 && <HeatmapLayer data={heatmapData} />}
      </MapContainer>
    </div>
  )
}