"use client"
import { format, isToday, isYesterday, isTomorrow } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useHabits } from "@/app/context/HabitContext"

export default function Header() {
  const { date, setDate, habits } = useHabits()

  const getDateLabel = (d) => {
    if (isToday(d)) return "Today"
    if (isYesterday(d)) return "Yesterday"
    if (isTomorrow(d)) return "Tomorrow"
    return format(d, "MMM d")
  }

  return (
    <div className="flex items-center justify-between gap-2 w-full">
      <div>
        <h1 className="text-lg md:text-2xl font-bold text-gray-900">Hi, Rohit 👋</h1>
        <p className="hidden sm:block text-gray-500 text-xs">{habits.length} habits today</p>
      </div>
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
        <Button variant="ghost" size="icon" className="h-7 w-7 hidden md:flex"><ChevronLeft className="w-4 h-4" /></Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-8 px-2 text-sm font-bold text-purple-700">
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              <span>{getDateLabel(date)}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="p-0"><Calendar mode="single" selected={date} onSelect={setDate} /></PopoverContent>
        </Popover>
        <Button variant="ghost" size="icon" className="h-7 w-7 hidden md:flex"><ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  )
}