'use client'

import { useEffect } from 'react'
import L from 'leaflet'

export default function IconInitializer() {
  useEffect(() => {
    // This needs to run only in the browser
    if (typeof window !== 'undefined') {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/marker-icon-2x.png',
        iconUrl: '/marker-icon.png',
        shadowUrl: '/marker-shadow.png',
      })
    }
  }, [])
  
  return null
}