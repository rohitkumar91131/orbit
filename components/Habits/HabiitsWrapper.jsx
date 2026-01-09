"use client"

import { useEffect } from "react"
import Header from "@/components/Habits/Header"
import HabitList from "@/components/Habits/HabitList"
import AddHabit from "@/components/Habits/AddHabit"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { useHabits } from "@/app/context/HabitContext"
import DotWaveBackground from "../Loading/DotWaveBackground"

export default function HabitsWrapper() {
  const { habits, date, fetchHabits } = useHabits()

  useEffect(() => {
    fetchHabits()
  }, []) 

  const todayStr = format(date, "yyyy-MM-dd")
  const completedToday = habits.filter(h => h.completedDates?.includes(todayStr)).length
  const progress = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50/50 relative overflow-hidden">
      
      {/* 1. Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <DotWaveBackground />
      </div>

      {/* 2. Content Layer (Z-Index added to sit on top of background) */}
      <div className="relative z-10 p-4 md:p-10 space-y-6">
        <Header />
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span>Daily Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" indicatorClassName="bg-purple-600" />
        </div>

        <HabitList />
        <AddHabit />
      </div>

    </div>
  )
}