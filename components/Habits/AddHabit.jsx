"use client"

import { useState } from "react"
import { Sparkles, Loader2, BrainCircuit, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useHabits } from "@/app/context/HabitContext"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function AIAddHabit() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { addHabit } = useHabits()

  const handleMagicSchedule = async () => {
    if (!prompt.trim()) return
    setLoading(true)

    try {
      const response = await fetch("/api/ai/parse-habit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (data.success) {
        addHabit({
          title: data.habit.title,
          startTime: data.habit.startTime,
          endTime: data.habit.endTime,
          syncToCalendar: true,
        })
        
        toast.success("AI has scheduled your habit!", {
          description: `${data.habit.title} at ${data.habit.startTime}`,
        })
        setPrompt("")
        setOpen(false)
      } else {
        throw new Error("AI failed to parse")
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            size="lg" 
            className="rounded-full h-16 px-8 bg-black text-white hover:bg-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.2)] group transition-all"
          >
            <Sparkles className="mr-2 h-5 w-5 text-purple-400 group-hover:animate-pulse" />
            <span className="font-bold text-lg">AI Schedule</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-white rounded-[32px]">
          <div className="bg-zinc-950 p-8 text-white">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-none">
                  Beta
                </Badge>
                <BrainCircuit className="w-5 h-5 text-purple-400" />
              </div>
              <DialogTitle className="text-3xl font-black tracking-tight">
                What's on your <span className="text-purple-400">mind?</span>
              </DialogTitle>
            </DialogHeader>
            <p className="text-zinc-400 mt-2 text-sm">
              Just tell me what you want to do and when. I'll handle the rest.
            </p>
          </div>

          <div className="p-8 space-y-6">
            <Textarea
              placeholder="e.g., I want to meditate for 20 minutes tomorrow starting at 6:30 AM"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[140px] text-lg p-6 rounded-2xl border-zinc-100 bg-zinc-50 focus-visible:ring-purple-500 resize-none transition-all"
            />

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleMagicSchedule}
                disabled={loading || !prompt}
                className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-lg font-bold transition-all shadow-lg shadow-purple-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing your intent...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Confirm Schedule
                  </>
                )}
              </Button>
              <p className="text-center text-[11px] text-zinc-400 uppercase tracking-widest font-medium">
                Powered by Gemini AI
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}