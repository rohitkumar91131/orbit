"use client"

import { format, isToday, isYesterday, isTomorrow, addDays, subDays } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useHabits } from "@/app/context/HabitContext"
import { useSession } from "next-auth/react"

export default function Header() {
  const { date, setDate, habits } = useHabits()
  const { data: session } = useSession()

  const name = session?.user?.name?.split(" ")[0] || "User"
  const habitCount = habits?.length || 0

  const getDateLabel = (d) => {
    if (isToday(d)) return "Today"
    if (isYesterday(d)) return "Yesterday"
    if (isTomorrow(d)) return "Tomorrow"
    return format(d, "EEE, MMM d") // Example: Mon, Oct 25
  }

  // Navigation Logic
  const goToPreviousDay = () => setDate(subDays(date, 1))
  const goToNextDay = () => setDate(addDays(date, 1))

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full mb-6">
      
      {/* Greeting Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">
          Hi, {name} 👋
        </h1>
        <p className="text-zinc-500 font-medium text-sm mt-1">
          You have <span className="text-purple-600 font-bold">{habitCount} habits</span> scheduled for this day.
        </p>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center self-start md:self-auto bg-white p-1.5 rounded-2xl shadow-sm border border-zinc-200/60">
        
        {/* Previous Day */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl" 
          onClick={goToPreviousDay}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Date Picker Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-9 px-4 text-sm font-bold text-zinc-800 hover:bg-zinc-50 hover:text-purple-700 transition-colors mx-1">
              <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
              <span>{getDateLabel(date)}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="p-0 border-none shadow-xl rounded-2xl">
            <Calendar 
              mode="single" 
              selected={date} 
              onSelect={(d) => d && setDate(d)} 
              className="rounded-2xl border border-zinc-100"
            />
          </PopoverContent>
        </Popover>

        {/* Next Day */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl" 
          onClick={goToNextDay}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}