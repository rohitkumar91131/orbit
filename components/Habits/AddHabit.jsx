"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useHabits } from "@/app/context/HabitContext"
import { toast } from "sonner"

export default function AddHabit() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")

  const { addHabit } = useHabits()

  const handleSubmit = async () => {
    if (!title.trim()) return

    setLoading(true)
    try {
      await addHabit({ title })
      toast.success("Habit added")
      setOpen(false)
      setTitle("") 
    } catch (error) {
      toast.error("Failed to add habit")
    } finally {
      setLoading(false)
    }
  }

  return (
    // Responsive positioning: Mobile pe thoda close, Desktop (md) pe thoda dur
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {/* Button size thoda adjust kiya responsive ke liye */}
          <Button size="icon" className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-black text-white hover:bg-zinc-800 shadow-xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center">
            <Plus className="h-6 w-6 md:h-8 md:w-8" />
            <span className="sr-only">Add Habit</span>
          </Button>
        </DialogTrigger>

        {/* w-[90%] -> Mobile pe screen ka 90% width
            sm:max-w-[400px] -> Desktop/Tablet pe max 400px
            rounded-2xl -> Smooth corners
        */}
        <DialogContent className="w-[90%] sm:w-full sm:max-w-[400px] p-5 md:p-6 bg-white rounded-2xl md:rounded-3xl border-zinc-100 shadow-xl gap-5 md:gap-6">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight">New Habit</DialogTitle>
            <DialogDescription className="text-zinc-500 text-sm md:text-base">
              What do you want to track today?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input 
              placeholder="e.g. Drink Water..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              // Mobile pe font size 16px zaroori hai taki iOS zoom na kare
              className="h-12 md:h-14 text-base md:text-lg bg-zinc-50 border-zinc-200 rounded-xl px-4 focus-visible:ring-black"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit()
              }}
            />

            <Button 
                onClick={handleSubmit} 
                disabled={loading || !title.trim()} 
                className="w-full h-12 rounded-xl font-bold text-base bg-black hover:bg-zinc-800 text-white"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Add Habit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}