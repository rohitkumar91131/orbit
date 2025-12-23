"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Flame, Clock, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import HabitDetailModal from "./HabitDetailModal"
import { useHabits } from "@/app/context/HabitContext"
import { cn } from "@/lib/utils"

export default function HabitList() {
  const { habits, toggleHabit, date, openHabitModal } = useHabits()

  const todayStr = format(date, "yyyy-MM-dd")
  const sortedHabits = [...habits].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))

  return (
    <>
      <div className="relative space-y-8 left-2">
        {/* Timeline Line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-purple-500/50 via-indigo-400/30 to-transparent" />

        {sortedHabits.map(habit => {
          const isDoneToday = habit.completedDates?.includes(todayStr)

          return (
            <div key={habit._id} className="relative pl-10 group">
              {/* Timeline Node */}
              <div className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-4 flex items-center justify-center z-10 transition-all",
                  isDoneToday ? "bg-purple-600 border-purple-100 shadow-[0_0_15px_rgba(147,51,234,0.5)]" : "bg-background border-muted"
              )}>
                <div className={cn("w-2 h-2 rounded-full", isDoneToday ? "bg-white animate-pulse" : "bg-muted-foreground/40")} />
              </div>

              {/* Card */}
              <div
                onClick={() => openHabitModal(habit)}
                className={cn(
                  "flex items-center justify-between p-5 rounded-3xl cursor-pointer transition-all border",
                  isDoneToday ? "bg-background/60 border-purple-100 opacity-70 scale-[0.98]" : "bg-background shadow hover:shadow-xl hover:-translate-y-1"
                )}
              >
                <div className="flex items-center gap-5">
                  <div className="hidden md:flex flex-col items-center pr-5 border-r">
                    <span className="text-sm font-black">{habit.startTime}</span>
                    <span className="text-[10px] text-muted-foreground">TIME</span>
                  </div>

                  <div>
                    <h3 className={cn("font-bold", isDoneToday ? "line-through text-muted-foreground" : "text-foreground")}>
                      {habit.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-[10px] font-bold text-orange-600">
                        <Flame className="w-3 h-3 fill-orange-500" />
                        {habit.streak || 0} DAY STREAK
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={isDoneToday}
                    onCheckedChange={() => toggleHabit(habit._id)}
                    onClick={e => e.stopPropagation()}
                    className="w-6 h-6 rounded-xl"
                  />
                  {!isDoneToday && <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />}
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