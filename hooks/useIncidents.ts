import { useTime } from '@/contexts/TimeContext'
import { START_DATE } from '@/components/TimeSlider'
import { useMemo } from 'react'
import { useMotherDuckClientState } from '@/lib/motherduck/context/motherduckClientContext'
import { Incident } from '@/types/incidents'
import { useState, useEffect } from 'react'
import type { DuckDBRow } from '@motherduck/wasm-client'
/*
all columns, used for llm dont delete
"Incident Datetime",
"Incident Date",
"Incident Time",
"Incident Year",
"Incident Day of Week",
"Report Datetime",
"Row ID",
"Incident ID",
"Incident Number",
"CAD Number",
"Report Type Code",
"Report Type Description",
"Filed Online",
"Incident Code",
"Incident Category",
"Incident Subcategory",
"Incident Description",
Resolution,
Intersection,
*/

const SQL_QUERY = `
WITH filtered_data AS (
  SELECT
    Date,
    "Primary Type" AS primary_type,
    Latitude,
    Longitude
  FROM
    cleanedChicago.cleaned_chicago_crime_data
  WHERE Date >= TIMESTAMP '2020-01-01'
    AND Date <= TIMESTAMP '2024-12-31'
)
SELECT 
  Latitude as latitude,
  Longitude as longitude,
  primary_type,
  Date::VARCHAR AS date
FROM filtered_data
`

type WeeklyIncidents = { [weekIndex: number]: Incident[] }

export function useIncidents() {
  const { safeEvaluateQuery } = useMotherDuckClientState()
  const { selectedWeek } = useTime()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [rawData, setRawData] = useState<Incident[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await safeEvaluateQuery(SQL_QUERY)
        if (result.status === "success") {
          const incidents = result.result.data.toRows().map((row: DuckDBRow) => ({
            latitude: Number(row.latitude) || 0,
            longitude: Number(row.longitude) || 0,
            primary_type: String(row.primary_type || ''),
            date: String(row.date || ''),
            weight: 1 // Adding default weight
          }))
          setRawData(incidents)
          setError(null)
        } else {
          setError(new Error(result.err.message))
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [safeEvaluateQuery])

  // Pre-process data into weekly chunks when rawData changes
  const weeklyData = useMemo(() => {
    if (!rawData) return {}

    const weeklyChunks: WeeklyIncidents = {}
    
    rawData.forEach(incident => {
      const incidentDate = new Date(incident.date)
      const weekIndex = Math.floor((incidentDate.getTime() - new Date(START_DATE).getTime()) / (7 * 24 * 60 * 60 * 1000))
      
      if (!weeklyChunks[weekIndex]) {
        weeklyChunks[weekIndex] = []
      }
      weeklyChunks[weekIndex].push(incident)
    })

    return weeklyChunks
  }, [rawData])

  // Get data for selected week
  const data = useMemo(() => {
    return weeklyData[selectedWeek] || []
  }, [weeklyData, selectedWeek])

  return {
    data,
    isLoading,
    error
  }
}

