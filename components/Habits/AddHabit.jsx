"use client"
import { useState } from "react"
import { Plus, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useHabits } from "@/app/context/HabitContext"

export default function AddHabit() {
  const [text, setText] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [syncToCalendar, setSyncToCalendar] = useState(false)
  const [open, setOpen] = useState(false) 

  const { addHabit } = useHabits()

  const handleSave = () => {
    if (text.trim()) {
      // Habit context mein data bhej rahe hain
      addHabit({
        title: text,
        startTime,
        endTime,
        syncToCalendar
      })
      
      // Reset fields
      setText("")
      setSyncToCalendar(false)
      setOpen(false) 
    }
  }

  return (
    <div className="fixed bottom-6 right-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="icon" className="h-14 w-14 rounded-full bg-black shadow-2xl hover:scale-110 transition-transform">
            <Plus className="h-7 w-7 text-white" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create New Habit</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Habit Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-500">HABIT NAME</Label>
              <Input 
                id="title"
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                placeholder="e.g. Deep Work, Gym, Meditation" 
                className="focus-visible:ring-purple-500"
              />
            </div>

            {/* Time Picker Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-500">START TIME</Label>
                <Input 
                  type="time" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)} 
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-500">END TIME</Label>
                <Input 
                  type="time" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)} 
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* Google Calendar Sync Toggle */}
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
              <Checkbox 
                id="sync" 
                checked={syncToCalendar} 
                onCheckedChange={setSyncToCalendar} 
                className="data-[state=checked]:bg-purple-600"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="sync"
                  className="text-sm font-semibold text-purple-900 flex items-center gap-2"
                >
                  <CalendarIcon className="w-4 h-4" />
                  Sync to Google Calendar
                </label>
                <p className="text-[11px] text-purple-600">
                  This will create an event in your primary calendar.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave} className="w-full bg-purple-600 hover:bg-purple-700 h-11 text-lg font-semibold">
              Create Habit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}