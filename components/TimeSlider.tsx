'use client'

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { useTime } from "@/contexts/TimeContext"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

// Update the date constants
export const START_DATE = '2020-01-01'
export const END_DATE = '2024-12-31'

// Update your TimeSlider component to accept date props
interface TimeSliderProps {
  startDate?: string;
  endDate?: string;
}

export default function TimeSlider({ startDate = START_DATE, endDate = END_DATE }: TimeSliderProps) {
  const { selectedWeek, setSelectedWeek } = useTime()
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [smoothValue, setSmoothValue] = useState(selectedWeek)
  const [currentDate, setCurrentDate] = useState<string>('')
  const animationFrameRef = useRef<number>()
  const lastTimeRef = useRef<number>()

  // Calculate and set the current date only on the client side
  useEffect(() => {
    const date = new Date(new Date(startDate).getTime() + Math.floor(smoothValue) * 7 * 24 * 60 * 60 * 1000)
    setCurrentDate(date.toISOString().split('T')[0])
    
    // Try to load playback speed from localStorage
    const saved = localStorage.getItem('playback-speed')
    if (saved) {
      setPlaybackSpeed(parseInt(saved, 10))
    }
  }, [smoothValue, startDate])

  // Save playback speed to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('playback-speed', playbackSpeed.toString())
  }, [playbackSpeed])

  useEffect(() => {
    // Update smooth value when selectedWeek changes manually
    if (!isPlaying) {
      setSmoothValue(selectedWeek)
    }
  }, [selectedWeek, isPlaying])

  // Animation logic remains the same
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      lastTimeRef.current = undefined
      return
    }

    const animate = (currentTime: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime
      }

      const deltaTime = (currentTime - lastTimeRef.current) / 1000 // Convert to seconds
      const weekIncrement = playbackSpeed * deltaTime
      const nextValue = smoothValue + weekIncrement

      const totalWeeks = Math.floor((new Date(END_DATE).getTime() - new Date(START_DATE).getTime()) / (7 * 24 * 60 * 60 * 1000))
      if (nextValue >= totalWeeks) {
        setIsPlaying(false)
        setSelectedWeek(totalWeeks - 1)
        setSmoothValue(totalWeeks - 1)
        return
      }

      setSmoothValue(nextValue)
      // Only update the actual week when crossing integer boundaries
      if (Math.floor(nextValue) !== selectedWeek) {
        setSelectedWeek(Math.floor(nextValue))
      }

      lastTimeRef.current = currentTime
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, playbackSpeed, smoothValue, selectedWeek, setSelectedWeek])

  const handleSliderChange = (value: number[]) => {
    setSelectedWeek(value[0])
    setSmoothValue(value[0])
  }

  const getCurrentDate = () => {
    // Use smoothValue for display during animation
    const date = new Date(new Date(START_DATE).getTime() + Math.floor(smoothValue) * 7 * 24 * 60 * 60 * 1000)
    return date.toISOString().split('T')[0]
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSpeedChange = () => {
    // Cycle through speeds: 1 -> 2 -> 4 -> 8 -> 16 -> 32 -> 1
    setPlaybackSpeed(prev => prev === 32 ? 1 : prev * 2)
  }

  return (
    <div className="bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow">
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="time-slider" className="text-sm font-medium">
          Select Week:
        </Label>
        <span className="text-sm font-medium">{currentDate || startDate}</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlayPause}
          className="h-8 w-8"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="4" height="16" x="6" y="4"></rect><rect width="4" height="16" x="14" y="4"></rect></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSpeedChange}
          className="h-8 w-14 text-xs"
        >
          {playbackSpeed}x
        </Button>
      </div>
      <Slider
        id="time-slider"
        max={Math.floor((new Date(END_DATE).getTime() - new Date(START_DATE).getTime()) / (7 * 24 * 60 * 60 * 1000))}
        step={1}
        value={[isPlaying ? Math.floor(smoothValue) : selectedWeek]}
        onValueChange={handleSliderChange}
      />
    </div>
  )
}

