"use client"

import { useEffect } from "react"
import Header from "@/components/Habits/Header"
import HabitList from "@/components/Habits/HabitList"
import AddHabit from "@/components/Habits/AddHabit"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { useHabits } from "@/app/context/HabitContext"

export default function HabitsWrapper() {
  const { habits, date, fetchHabits } = useHabits()

  useEffect(() => {
    fetchHabits()
    // Empty dependency [] stops the infinite loop
  }, []) 

  const todayStr = format(date, "yyyy-MM-dd")
  const completedToday = habits.filter(h => h.completedDates?.includes(todayStr)).length
  const progress = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0

  return (
    // Design KEPT EXACTLY SAME as you requested
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-10 space-y-6">
      <Header />
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-gray-500 uppercase tracking-wider">
          <span>Daily Progress</span>
          <span>{progress}%</span>
        </div>
        {/* Purple design kept */}
        <Progress value={progress} className="h-1.5" indicatorClassName="bg-purple-600" />
      </div>

      <HabitList />
      <AddHabit />
    </div>
  )
}