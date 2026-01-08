"use client"

import { format, isToday, isYesterday, isTomorrow, addDays, subDays } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useHabits } from "@/app/context/HabitContext"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

export default function Header() {
  const { date, setDate, habits } = useHabits()
  const { data: session } = useSession()

  const name = session?.user?.name?.split(" ")[0] || "User"
  
  // Calculate completed count for the specific day
  const selectedDateStr = format(date, "yyyy-MM-dd")
  const totalHabits = habits.length
  const completedCount = habits.filter(h => h.completedDates?.includes(selectedDateStr)).length

  const getDateLabel = (d) => {
    if (isToday(d)) return "Today"
    if (isYesterday(d)) return "Yesterday"
    if (isTomorrow(d)) return "Tomorrow"
    return format(d, "EEE, MMM d") 
  }

  return (
    <div className="flex flex-col gap-2 mb-8">
      
      {/* Top Row: Name (Left) & Date Selector (Right) */}
      <div className="flex items-center justify-between">
        
        {/* Greeting */}
        <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tighter truncate max-w-[50%]">
          Hi, {name} <span className="hidden sm:inline-block">👋</span>
        </h1>

        {/* Date Selector - Compact & Pill Shaped */}
        <div className="flex items-center bg-white p-1 rounded-full shadow-sm border border-zinc-200/80">
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full text-zinc-400 hover:text-black hover:bg-zinc-100 transition-all" 
            onClick={() => setDate(subDays(date, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 px-3 text-xs md:text-sm font-bold text-zinc-700 hover:bg-zinc-50 hover:text-purple-700 transition-colors rounded-full"
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5 text-purple-500 mb-0.5" />
                <span>{getDateLabel(date)}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 border-none shadow-2xl rounded-2xl w-auto">
              <Calendar 
                mode="single" 
                selected={date} 
                onSelect={(d) => d && setDate(d)} 
                initialFocus
                className="rounded-2xl border border-zinc-100 bg-white"
              />
            </PopoverContent>
          </Popover>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full text-zinc-400 hover:text-black hover:bg-zinc-100 transition-all" 
            onClick={() => setDate(addDays(date, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Subtitle / Stats Line */}
      <p className="text-zinc-500 font-medium text-xs md:text-sm">
        <span className={cn(
            "font-bold transition-colors", 
            completedCount === totalHabits && totalHabits > 0 ? "text-green-600" : "text-purple-600"
        )}>
            {completedCount}/{totalHabits} done
        </span> 
        {" "}for this day.
      </p>

    </div>
  )
}