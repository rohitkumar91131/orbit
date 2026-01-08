"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Flame, ChevronRight } from "lucide-react"
import { format, subDays, isSameDay, parseISO } from "date-fns" // ✅ Added imports
import HabitDetailModal from "./HabitDetailModal"
import { useHabits } from "@/app/context/HabitContext"
import { cn } from "@/lib/utils"

export default function HabitList() {
  const { habits, toggleHabit, date, openHabitModal } = useHabits()
  const selectedDateStr = format(date, "yyyy-MM-dd")

  // ✅ Helper: Frontend Streak Calculation
  // Ye turant update dikhayega bina server ka wait kiye
  const getStreak = (completedDates) => {
    if (!completedDates || completedDates.length === 0) return 0

    // Dates ko sort karo (Latest first)
    const sorted = [...completedDates].sort((a, b) => new Date(b) - new Date(a))
    
    const today = new Date()
    const todayStr = format(today, "yyyy-MM-dd")
    const yesterdayStr = format(subDays(today, 1), "yyyy-MM-dd")

    // Agar latest entry aaj ya kal ki nahi hai, to streak toot gayi
    const latest = sorted[0]
    if (latest !== todayStr && latest !== yesterdayStr) return 0

    let streak = 0
    let currentCheckDate = today

    // Check consecutive days
    for (const dateStr of sorted) {
      // Agar date match kare (aaj ya pichli streak date)
      if (isSameDay(parseISO(dateStr), currentCheckDate)) {
        streak++
        currentCheckDate = subDays(currentCheckDate, 1) // Ek din peeche jao
      } 
      // Agar user ne aaj skip kiya lekin kal kiya tha (Logic handle: Today is optional for breaking streak until day ends)
      else if (isSameDay(parseISO(dateStr), subDays(currentCheckDate, 1))) {
        // Gap dhoondo
        const diff = (currentCheckDate - parseISO(dateStr)) / (1000 * 60 * 60 * 24)
        if(diff > 1) break; 
      }
    }
    
    // Simple logic fallback: Consecutive count
    let count = 0
    let checkDate = new Date()
    
    // Check for today
    if (completedDates.includes(format(checkDate, "yyyy-MM-dd"))) {
        count++
        checkDate = subDays(checkDate, 1)
    } else {
        // Agar aaj nahi kiya, to kal se check karo
        if (!completedDates.includes(format(subDays(checkDate, 1), "yyyy-MM-dd"))) {
            return 0
        }
        checkDate = subDays(checkDate, 1)
    }

    while (true) {
        if (completedDates.includes(format(checkDate, "yyyy-MM-dd"))) {
            count++
            checkDate = subDays(checkDate, 1)
        } else {
            break
        }
    }
    return count
  }

  return (
    <>
      <div className="relative space-y-6 left-2 pb-20">
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-purple-500/50 via-indigo-400/30 to-transparent" />

        {habits.map(habit => {
          const isCompletedOnSelectedDate = habit.completedDates?.includes(selectedDateStr)
          
          // ✅ Calculate Live Streak here
          const currentStreak = getStreak(habit.completedDates)

          return (
            <div key={habit._id} className="relative pl-10 group">
              
              {/* Timeline Node */}
              <div className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-4 flex items-center justify-center z-10 transition-all duration-300",
                  isCompletedOnSelectedDate 
                    ? "bg-purple-600 border-purple-200 shadow-[0_0_15px_rgba(147,51,234,0.6)] scale-110" 
                    : "bg-background border-muted"
              )}>
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300", 
                  isCompletedOnSelectedDate ? "bg-white animate-pulse" : "bg-muted-foreground/30"
                )} />
              </div>

              {/* Card */}
              <div
                onClick={() => openHabitModal(habit)}
                className={cn(
                  "flex items-center justify-between p-5 rounded-3xl cursor-pointer transition-all duration-300 border backdrop-blur-sm",
                  isCompletedOnSelectedDate 
                    ? "bg-purple-50/50 border-purple-200 opacity-80" 
                    : "bg-background/80 shadow-sm border-transparent hover:shadow-lg hover:-translate-y-0.5"
                )}
              >
                <div className="flex items-center gap-5">
                  {habit.startTime && (
                    <div className={cn(
                        "hidden md:flex flex-col items-center pr-5 border-r transition-colors",
                        isCompletedOnSelectedDate ? "border-purple-200/50" : "border-border"
                    )}>
                        <span className="text-sm font-black text-foreground/80">{habit.startTime}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">TIME</span>
                    </div>
                  )}

                  <div>
                    <h3 className={cn(
                      "font-bold text-lg transition-all", 
                      isCompletedOnSelectedDate ? "line-through text-muted-foreground decoration-purple-400 decoration-2" : "text-foreground"
                    )}>
                      {habit.title}
                    </h3>
                    
                    {/* Streak Badge: Uses currentStreak instead of habit.streak */}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={cn(
                        "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors",
                        currentStreak > 0 
                          ? "bg-orange-50 text-orange-600 border-orange-100" 
                          : "bg-gray-50 text-gray-400 border-gray-100"
                      )}>
                        <Flame className={cn("w-3 h-3", currentStreak > 0 ? "fill-orange-500 text-orange-500" : "text-gray-400")} />
                        {currentStreak} DAY STREAK
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pl-4">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleHabit(habit._id); 
                    }}
                    className="p-2 -m-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={isCompletedOnSelectedDate}
                      className={cn(
                        "w-7 h-7 rounded-full border-2 transition-all duration-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600",
                        !isCompletedOnSelectedDate && "hover:border-purple-400"
                      )}
                    />
                  </div>
                  
                  {!isCompletedOnSelectedDate && (
                    <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <HabitDetailModal />
    </>
  )
}