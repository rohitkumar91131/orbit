"use client"

import { useEffect, useRef, useMemo, useState } from "react"
import gsap from "gsap"
import { Flame, ArrowLeft, Calendar, Target, Sparkles, RefreshCw, Trash2 } from "lucide-react" // Trash2 icon laye
import { format, getDaysInMonth } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useHabits } from "@/app/context/HabitContext"
import { cn } from "@/lib/utils"

export default function HabitDetailModal() {
  const { activeHabit, isModalOpen, closeHabitModal, date, saveJournal, deleteHabitLog } = useHabits()
  const sheetRef = useRef(null)
  const overlayRef = useRef(null)

  // AI & Journal states
  const [insight, setInsight] = useState("Consistency beats motivation.")
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [journalText, setJournalText] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const safeHabit = activeHabit ?? { title: "", streak: 0, completedDates: [], logs: [] }
  const selectedDateStr = format(date, "yyyy-MM-dd")
  
  // Check karo agar us din ka koi data exist karta hai (Journal ya Completed)
  const hasLogForDate = useMemo(() => {
    const log = safeHabit.logs?.find(l => l.date === selectedDateStr);
    const isCompleted = safeHabit.completedDates?.includes(selectedDateStr);
    return !!log || isCompleted;
  }, [safeHabit, selectedDateStr]);

  // Load Journal
  useEffect(() => {
    if (activeHabit && isModalOpen) {
        const logForDate = activeHabit.logs?.find(l => l.date === selectedDateStr)
        setJournalText(logForDate?.journal || "")
        // AI logic...
    }
  }, [isModalOpen, activeHabit, selectedDateStr])

  // Save Logic
  const handleSave = async () => {
    setIsSaving(true)
    await saveJournal(activeHabit._id, journalText)
    setIsSaving(false)
  }

  // Delete/Reset Logic
  const handleDeleteLog = async () => {
    if(confirm("Are you sure you want to clear data for this specific day?")) {
        await deleteHabitLog(activeHabit._id)
        setJournalText("") // Text area clear karo
        setInsight("Data cleared for this day.") // AI Insight reset
    }
  }

  // Animation Logic (Same as before)
  useEffect(() => {
    if (isModalOpen) {
      gsap.to(overlayRef.current, { opacity: 1, pointerEvents: "auto", duration: 0.3 })
      gsap.fromTo(sheetRef.current, { x: "100%" }, { x: 0, duration: 0.5, ease: "power3.out" })
    } else {
      gsap.to(overlayRef.current, { opacity: 0, pointerEvents: "none", duration: 0.2 })
      gsap.to(sheetRef.current, { x: "100%", duration: 0.4, ease: "power3.in" })
    }
  }, [isModalOpen])

  // Stats Logic (Same as before)
  const today = new Date(); const daysInMonth = getDaysInMonth(today); const monthKey = format(today, "yyyy-MM");
  const completedThisMonth = safeHabit.completedDates.filter(d => d.startsWith(monthKey)).length;
  const completionPercent = Math.round((completedThisMonth / daysInMonth) * 100) || 0;
  const fetchAIInsight = async () => { /* Same code */ }

  return (
    <>
      <div ref={overlayRef} onClick={closeHabitModal} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md opacity-0 pointer-events-none" />

      <div ref={sheetRef} className="fixed right-0 top-0 z-50 h-[100dvh] w-full sm:w-[420px] bg-background shadow-2xl translate-x-full flex flex-col">
        {/* Header Section */}
        <header className="relative px-6 pt-6 pb-8 bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-600 text-white">
          <div className="flex justify-between items-start">
            <Button size="icon" variant="ghost" onClick={closeHabitModal} className="rounded-full text-white hover:bg-white/20">
                <ArrowLeft className="w-5 h-5" />
            </Button>

            {/* NEW: Delete Button (Sirf tab dikhega jab us din ka data ho) */}
            {hasLogForDate && (
                <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={handleDeleteLog} 
                    className="rounded-full text-red-200 hover:bg-red-500/20 hover:text-white"
                    title="Reset for this day"
                >
                    <Trash2 className="w-5 h-5" />
                </Button>
            )}
          </div>

          <div className="mt-6">
            <p className="text-[11px] tracking-widest uppercase opacity-80">Current Streak</p>
            <div className="flex items-center gap-2 mt-1">
              <Flame className="w-6 h-6 text-orange-300 fill-orange-300" />
              <span className="text-4xl font-black">{safeHabit.streak}</span>
            </div>
            <h2 className="mt-4 text-3xl font-black leading-tight">{safeHabit.title}</h2>
            <p className="text-xs text-purple-200 mt-1 font-medium">Viewing for: {format(date, "MMM dd, yyyy")}</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
            {/* ... (AI Section, Stats Grid, Journal Section SAME as before) ... */}
            
            {/* AI Section (Included for context) */}
            <section className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 p-5 rounded-2xl relative">
                {/* AI content */}
                <p className="text-sm text-purple-900 leading-relaxed font-medium">
                {isLoadingAI ? "Analyzing..." : insight}
                </p>
            </section>

             {/* Stats Grid (Included for context) */}
            <section className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-zinc-50 border">
                    <Target className="w-5 h-5 text-zinc-400 mb-1" />
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Progress</p>
                    <p className="text-2xl font-black">{completedThisMonth}/{daysInMonth}</p>
                </div>
                <div className="p-5 rounded-2xl bg-zinc-50 border">
                    <Calendar className="w-5 h-5 text-zinc-400 mb-1" />
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Consistency</p>
                    <p className="text-2xl font-black">{completionPercent}%</p>
                </div>
            </section>

            {/* Journal Section */}
            <section>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Daily Journal</p>
                <Textarea 
                    placeholder="What helped today? What didn’t?" 
                    className="min-h-[140px] rounded-2xl resize-none text-sm bg-zinc-50 border-zinc-200 focus-visible:ring-purple-500" 
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                />
            </section>

        </main>

        <footer className="p-5 border-t bg-background">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-14 rounded-2xl text-lg font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition-all active:scale-95"
          >
            {isSaving ? "Saving..." : "Save Progress"}
          </Button>
        </footer>
      </div>
    </>
  )
}