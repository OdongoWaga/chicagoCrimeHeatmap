"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, ReferenceLine } from "recharts"
import { useAllIncidents } from "../hooks/useAllIncidents"
import { useTime } from "@/contexts/TimeContext"
import { useMemo } from "react"
import { START_DATE } from "@/components/TimeSlider"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Update the chart configuration to match the Chicago crime categories
const chartConfig = {
  battery: {
    label: "Battery",
    color: "hsl(var(--chart-1))",
  },
  theft: {
    label: "Theft",
    color: "hsl(var(--chart-2))",
  },
  narcotics: {
    label: "Narcotics",
    color: "hsl(var(--chart-3))",
  },
  criminal_trespass: {
    label: "Criminal Trespass",
    color: "hsl(var(--chart-4))",
  },
  criminal_damage: {
    label: "Criminal Damage",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export default function CrimeCharts() {
  const { data, isLoading } = useAllIncidents()
  const { selectedWeek } = useTime()
  
  if (isLoading) {
    return <div>Loading chart data...</div>
  }

  const chartData = useMemo(() => {
    if (!data.length) return []
  
    const monthlyData: { [month: string]: any } = {}
    const startYear = 2018
    const endYear = 2023
    
    // Initialize months with all crime categories
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 0; month < 12; month++) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}`
        monthlyData[date] = {
          date,
          incidents: 0,
          battery: 0,
          theft: 0,
          narcotics: 0,
          criminal_trespass: 0,
          criminal_damage: 0
        }
      }
    }
    
    // Group incidents by month and crime type
    data.forEach((incident: { 
      date?: string; 
      primary_type?: string;
    }) => {
      if (!incident.date) return
      
      try {
        const date = new Date(incident.date)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        if (monthlyData[key]) {
          monthlyData[key].incidents += 1
          
          // Direct mapping for crime types
          const crimeType = incident.primary_type?.toUpperCase()
          
          if (crimeType === 'BATTERY') {
            monthlyData[key].battery += 1
          } else if (crimeType === 'THEFT') {
            monthlyData[key].theft += 1
          } else if (crimeType === 'NARCOTICS') {
            monthlyData[key].narcotics += 1
          } else if (crimeType === 'CRIMINAL TRESPASS') {
            monthlyData[key].criminal_trespass += 1
          } else if (crimeType === 'CRIMINAL DAMAGE') {
            monthlyData[key].criminal_damage += 1
          }
        }
      } catch (e) {
        console.error("Error processing incident:", incident, e)
      }
    })
    
    // Add debugging to see what data we have
    console.log("Sample chart data:", Object.values(monthlyData).slice(0, 2))
    console.log("Crime types in data:", [...new Set(data.map((i: { primary_type?: string }) => i.primary_type))])
    
    return Object.values(monthlyData).sort((a, b) => a.date.localeCompare(b.date))
  }, [data])

  // Calculate current reference line position
  const currentDate = useMemo(() => {
    const date = new Date(START_DATE)
    date.setDate(date.getDate() + selectedWeek * 7)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }, [selectedWeek])


  const ChartComponents = useMemo(() => ({
    bar: (
      <BarChart data={chartData} height={300}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          interval={6}
        />
        <ChartTooltip />
        <Bar dataKey="incidents" fill="var(--color-desktop)" radius={4} />
        <ReferenceLine
          x={currentDate}
          stroke="red"
          strokeDasharray="3 3"
          label={{ value: 'Current', position: 'top' }}
        />
      </BarChart>
    ),
    area: (
      <AreaChart
        data={chartData}
        height={300}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={6}
        />
        <ChartTooltip />
        <Area
          dataKey="battery"
          type="monotone"
          fill="var(--chart-1)"
          fillOpacity={0.4}
          stroke="var(--chart-1)"
          stackId="1"
        />
        <Area
          dataKey="theft"
          type="monotone"
          fill="var(--chart-2)"
          fillOpacity={0.4}
          stroke="var(--chart-2)"
          stackId="1"
        />
        <Area
          dataKey="narcotics"
          type="monotone"
          fill="var(--chart-3)"
          fillOpacity={0.4}
          stroke="var(--chart-3)"
          stackId="1"
        />
        <Area
          dataKey="criminal_trespass"
          type="monotone"
          fill="var(--chart-4)"
          fillOpacity={0.4}
          stroke="var(--chart-4)"
          stackId="1"
        />
        <Area
          dataKey="criminal_damage"
          type="monotone"
          fill="var(--chart-5)"
          fillOpacity={0.4}
          stroke="var(--chart-5)"
          stackId="1"
        />
        <ReferenceLine
          x={currentDate}
          stroke="red"
          strokeDasharray="3 3"
          label={{ value: 'Current', position: 'top' }}
        />
      </AreaChart>
    )
  }), [chartData, currentDate])

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Crime Distribution</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] animate-pulse bg-muted" />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Crime Trend</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] animate-pulse bg-muted" />
      </Card>
    </div>
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Crime Distribution</CardTitle>
          <CardDescription>Bar chart showing criminal incidents by month (2018-2025)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            {ChartComponents.bar}
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Crime Trend</CardTitle>
          <CardDescription>Area chart showing criminal incident distribution over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            {ChartComponents.area}
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}