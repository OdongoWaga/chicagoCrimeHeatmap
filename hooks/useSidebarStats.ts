import { useMotherDuckClientState } from '@/lib/motherduck/context/motherduckClientContext'
import { useState, useEffect } from 'react'
/*
all columns
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
CNN,
"Police District",
"Analysis Neighborhood",
"Supervisor District",
"Supervisor District 2012",
Latitude,
Longitude,
Point,
Neighborhoods,
"ESNCAG - Boundary File",
"Central Market/Tenderloin Boundary Polygon - Updated",
"Civic Center Harm Reduction Project Boundary",
"HSOC Zones as of 2018-06-05",
"Invest In Neighborhoods (IIN) Areas",
"Current Supervisor Districts",
"Current Police Districts"
*/
export interface MonthlyStats {
  date: string
  total: number
  battery: number
  theft: number
  narcotics: number
  criminal_trespass: number
  criminal_damage: number
  assault: number
}

const SQL_QUERY = `
WITH parsed_dates AS (
  SELECT 
    Date as parsed_datetime,
    "Primary Type" as crime_type,
    COUNT(*) as count
  FROM 
    cleanedChicago.cleaned_chicago_crime_data
  WHERE 
    Date >= TIMESTAMP '2018-01-01'
    AND Date <= TIMESTAMP '2023-12-31'
    AND "Primary Type" NOT IN ('NON - CRIMINAL', 'NON-CRIMINAL', 'NON-CRIMINAL (SUBJECT SPECIFIED)')
  GROUP BY 
    Date,
    "Primary Type"
),
monthly_stats AS (
  SELECT 
    DATE_TRUNC('month', parsed_datetime) as month,
    crime_type,
    SUM(count) as count
  FROM 
    parsed_dates
  GROUP BY 
    DATE_TRUNC('month', parsed_datetime),
    crime_type
)
SELECT 
  month::VARCHAR as date,
  SUM(count) as total,
  SUM(CASE WHEN crime_type = 'BATTERY' THEN count ELSE 0 END) as battery,
  SUM(CASE WHEN crime_type = 'THEFT' THEN count ELSE 0 END) as theft,
  SUM(CASE WHEN crime_type = 'NARCOTICS' THEN count ELSE 0 END) as narcotics,
  SUM(CASE WHEN crime_type = 'CRIMINAL TRESPASS' THEN count ELSE 0 END) as criminal_trespass,
  SUM(CASE WHEN crime_type = 'CRIMINAL DAMAGE' THEN count ELSE 0 END) as criminal_damage,
  SUM(CASE WHEN crime_type = 'ASSAULT' THEN count ELSE 0 END) as assault
FROM 
  monthly_stats
GROUP BY 
  month
ORDER BY 
  month;
`

export function useSidebarStats() {
  const { safeEvaluateQuery } = useMotherDuckClientState()
  const [data, setData] = useState<MonthlyStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await safeEvaluateQuery(SQL_QUERY)
        if (result.status === "success") {
          const stats = result.result.data.toRows().map((row: any) => ({
            date: row.date?.toString() ?? '',
            total: Number(row.total) || 0,
            battery: Number(row.battery) || 0,
            theft: Number(row.theft) || 0,
            narcotics: Number(row.narcotics) || 0,
            criminal_trespass: Number(row.criminal_trespass) || 0,
            criminal_damage: Number(row.criminal_damage) || 0,
            assault: Number(row.assault) || 0
          }))
          setData(stats)
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

  return {
    data,
    isLoading,
    error
  }
}