'use client'

import { useSidebarStats } from '@/hooks/useSidebarStats'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, ReferenceLine } from "recharts"
import { useTime } from '@/contexts/TimeContext'
import { START_DATE } from '@/components/TimeSlider'
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Define colors for Chicago crime categories
type CategoryName = 'THEFT' | 'BATTERY' | 'CRIMINAL DAMAGE' | 'NARCOTICS' | 'ASSAULT'
const categoryColors: Record<CategoryName, string> = {
  'THEFT': 'hsl(var(--chart-1))',
  'BATTERY': 'hsl(var(--chart-2))',
  'CRIMINAL DAMAGE': 'hsl(var(--chart-3))',
  'NARCOTICS': 'hsl(var(--chart-4))',
  'ASSAULT': 'hsl(var(--chart-5))',
}

const chartConfig = Object.entries(categoryColors).reduce((acc, [category, color]) => {
  acc[category.toLowerCase().replace(/\s+/g, '_')] = {
    label: category,
    color: color,
  }
  return acc
}, {} as ChartConfig)

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { data: stats, isLoading: currentLoading } = useSidebarStats()
  const { selectedWeek } = useTime()

  const chartData = stats

  // Calculate current reference line position
  const currentDate = useMemo(() => {
    const date = new Date(START_DATE)
    date.setDate(date.getDate() + selectedWeek * 7)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }, [selectedWeek])

  const totalIncidents = stats.reduce((sum, month) => sum + month.total, 0)
  const categoryCounts = {
    'THEFT': stats.reduce((sum, month) => sum + (month.theft || 0), 0),
    'BATTERY': stats.reduce((sum, month) => sum + (month.battery || 0), 0),
    'CRIMINAL DAMAGE': stats.reduce((sum, month) => sum + (month.criminal_damage || 0), 0),
    'NARCOTICS': stats.reduce((sum, month) => sum + (month.narcotics || 0), 0),
    'ASSAULT': stats.reduce((sum, month) => sum + (month.assault || 0), 0),
  }

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className={`bg-background border-r transition-all duration-300 ease-in-out ${isCollapsed ? 'w-12' : 'w-[600px]'} relative`}>
      {/* <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 -right-4 z-10 bg-background border"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
       */}
      {!isCollapsed && (
        <ScrollArea className="h-screen p-4">
          <div className="space-y-4 pr-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalIncidents.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Monthly Distribution</CardTitle>
                <CardDescription>Incidents by month (2018-2025)</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart data={chartData} height={200}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      interval={12}
                    />
                    <ChartTooltip />
                    <Bar dataKey="total" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    <ReferenceLine
                      x={currentDate}
                      stroke="red"
                      strokeDasharray="3 3"
                      label={{ value: 'Current', position: 'top' }}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Crime Trend by Category</CardTitle>
                <CardDescription>Distribution of top crime categories over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <AreaChart
                    data={chartData}
                    height={300}
                    margin={{
                      left: 12,
                      right: 12,
                      bottom: 32,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      interval={12}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      dataKey="theft"
                      type="monotone"
                      fill={categoryColors['THEFT']}
                      fillOpacity={0.4}
                      stroke={categoryColors['THEFT']}
                      stackId="1"
                    />
                    <Area
                      dataKey="battery"
                      type="monotone"
                      fill={categoryColors['BATTERY']}
                      fillOpacity={0.4}
                      stroke={categoryColors['BATTERY']}
                      stackId="1"
                    />
                    <Area
                      dataKey="criminal_damage"
                      type="monotone"
                      fill={categoryColors['CRIMINAL DAMAGE']}
                      fillOpacity={0.4}
                      stroke={categoryColors['CRIMINAL DAMAGE']}
                      stackId="1"
                    />
                    <Area
                      dataKey="narcotics"
                      type="monotone"
                      fill={categoryColors['NARCOTICS']}
                      fillOpacity={0.4}
                      stroke={categoryColors['NARCOTICS']}
                      stackId="1"
                    />
                    <Area
                      dataKey="assault"
                      type="monotone"
                      fill={categoryColors['ASSAULT']}
                      fillOpacity={0.4}
                      stroke={categoryColors['ASSAULT']}
                      stackId="1"
                    />
                    <ReferenceLine
                      x={currentDate}
                      stroke="red"
                      strokeDasharray="3 3"
                      label={{ value: 'Current', position: 'top' }}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

          <Card className="md:hidden">
            <CardHeader>
              <CardTitle>Map view is currently only available on larger (desktop) screens</CardTitle>
            </CardHeader>
          </Card>
          </div>
        </ScrollArea>
      )}
   
    </div>
  )
}

