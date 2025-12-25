"use client"

import { useState } from "react"
import { Sparkles, Loader2, ArrowLeft, Clock, AlignLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useHabits } from "@/app/context/HabitContext"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function AIAddHabit() {
  const [open, setOpen] = useState(false)
  const [isManual, setIsManual] = useState(false) 
  const [loading, setLoading] = useState(false)
  
  // AI State
  const [prompt, setPrompt] = useState("")

  // Manual State
  const [manualData, setManualData] = useState({
    title: "",
    startTime: "",
    endTime: ""
  })

  const { addHabit } = useHabits()

  const resetForm = () => {
    setPrompt("")
    setManualData({ title: "", startTime: "", endTime: "" })
    setIsManual(false)
    setLoading(false)
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      let payload = {}

      if (isManual) {
        // 1. Manual Validation
        if (!manualData.title || !manualData.startTime || !manualData.endTime) {
          toast.error("Missing Fields", { description: "Please provide a title and time range." })
          setLoading(false)
          return
        }
        payload = { ...manualData } 
      } else {
        // 2. AI Validation
        if (!prompt.trim()) return
        payload = { prompt }
      }

      // 3. Call API
      await addHabit(payload)

      toast.success("Habit Created!", {
        description: isManual ? "Manual entry saved." : "AI successfully scheduled your habit."
      })
      
      setOpen(false)
      resetForm()

    } catch (error) {
      toast.error("Creation Failed", { description: "Could not save the habit. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) resetForm(); }}>
        <DialogTrigger asChild>
          <Button size="lg" className="rounded-full h-16 px-6 bg-zinc-900 text-white hover:bg-zinc-800 shadow-2xl hover:shadow-purple-500/20 transition-all hover:scale-105 active:scale-95">
            <Sparkles className="mr-2 h-5 w-5 text-purple-400 animate-pulse" />
            <span className="font-bold text-lg tracking-tight">New Habit</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px] p-0 bg-white rounded-[32px] overflow-hidden border-none gap-0 shadow-2xl">
          <DialogDescription className="sr-only">Create a new habit using AI or manual entry</DialogDescription>
          
          {/* Header Section */}
          <div className="bg-zinc-950 p-8 pb-10 text-white relative overflow-hidden">
            {/* Background Gradient Effect */}
            <div className="absolute top-[-50%] right-[-10%] w-80 h-80 bg-purple-600/30 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-3xl font-black italic tracking-tighter">
                        {isManual ? "MANUAL ENTRY" : "AI WIZARD"}
                        </DialogTitle>
                        {isManual && (
                            <Button variant="ghost" size="sm" onClick={() => setIsManual(false)} className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Back
                            </Button>
                        )}
                    </div>
                </DialogHeader>
                <p className="text-zinc-400 mt-2 font-medium">
                {isManual 
                    ? "Set your schedule precisely." 
                    : 'Describe it, and we\'ll do the rest.'}
                </p>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-8 -mt-6 bg-white rounded-t-[32px] relative z-20 space-y-6">
            
            {/* VIEW 1: AI MODE */}
            {!isManual && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="relative">
                    <Textarea 
                      placeholder="e.g. I want to read books for 30 mins every night at 9 PM..." 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[140px] text-lg p-6 bg-zinc-50 border-zinc-100 rounded-3xl resize-none focus-visible:ring-2 focus-visible:ring-purple-500/20 focus-visible:border-purple-500/50 transition-all"
                      autoFocus
                    />
                    <Sparkles className="absolute bottom-4 right-4 h-5 w-5 text-purple-400/50 pointer-events-none" />
                </div>
                
                <div className="text-center">
                    <button 
                        onClick={() => setIsManual(true)}
                        className="text-sm font-semibold text-zinc-400 hover:text-zinc-900 transition-colors underline decoration-zinc-200 underline-offset-4"
                    >
                        Switch to manual input
                    </button>
                </div>
              </div>
            )}

            {/* VIEW 2: MANUAL MODE */}
            {isManual && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="space-y-2">
                    <label className="text-[10px] tracking-widest font-bold text-zinc-400 ml-1 flex items-center gap-1">
                        <AlignLeft className="w-3 h-3"/> TITLE
                    </label>
                    <Input 
                        placeholder="e.g. Morning Jog"
                        value={manualData.title}
                        onChange={(e) => setManualData({...manualData, title: e.target.value})}
                        className="h-14 text-lg bg-zinc-50 border-zinc-100 rounded-2xl px-5 focus-visible:ring-purple-500/20"
                        autoFocus
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] tracking-widest font-bold text-zinc-400 ml-1 flex items-center gap-1">
                            <Clock className="w-3 h-3"/> START
                        </label>
                        <Input 
                            type="time"
                            value={manualData.startTime}
                            onChange={(e) => setManualData({...manualData, startTime: e.target.value})}
                            className="h-14 text-lg bg-zinc-50 border-zinc-100 rounded-2xl px-5 focus-visible:ring-purple-500/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] tracking-widest font-bold text-zinc-400 ml-1 flex items-center gap-1">
                            <Clock className="w-3 h-3"/> END
                        </label>
                        <Input 
                            type="time"
                            value={manualData.endTime}
                            onChange={(e) => setManualData({...manualData, endTime: e.target.value})}
                            className="h-14 text-lg bg-zinc-50 border-zinc-100 rounded-2xl px-5 focus-visible:ring-purple-500/20"
                        />
                    </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button 
                onClick={handleSubmit} 
                disabled={loading || (!isManual && !prompt) || (isManual && !manualData.title)} 
                className={cn(
                    "w-full h-16 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-[0.98]",
                    isManual 
                        ? "bg-zinc-900 hover:bg-zinc-800 text-white shadow-zinc-300" 
                        : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200"
                )}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" />
                    <span>{isManual ? "Saving..." : "Magic in progress..."}</span>
                </div>
              ) : (
                isManual ? "Save Habit" : "Create with AI"
              )}
            </Button>

          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}