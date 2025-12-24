"use client"

import { useEffect, useRef, useMemo, useState } from "react" // useState add kiya
import gsap from "gsap"
import { Flame, ArrowLeft, Calendar, Target, Sparkles, RefreshCw } from "lucide-react" // Refresh icon add kiya
import { format, getDaysInMonth } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useHabits } from "@/app/context/HabitContext"

export default function HabitDetailModal() {
  const { activeHabit, isModalOpen, closeHabitModal } = useHabits()
  const sheetRef = useRef(null)
  const overlayRef = useRef(null)

  // AI states
  const [insight, setInsight] = useState("Consistency beats motivation.")
  const [isLoading, setIsLoading] = useState(false)

  const safeHabit = activeHabit ?? { title: "", streak: 0, completedDates: [] }
  const today = new Date()
  const daysInMonth = getDaysInMonth(today)
  const monthKey = format(today, "yyyy-MM")

  const completedThisMonth = useMemo(
    () => safeHabit.completedDates.filter(d => d.startsWith(monthKey)).length,
    [safeHabit.completedDates, monthKey]
  )

  const completionPercent = Math.round((completedThisMonth / daysInMonth) * 100) || 0

  const fetchAIInsight = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/review", {
        method: "POST",
        body: JSON.stringify({ 
            habitTitle: safeHabit.title, 
            progress: completionPercent 
        }),
      })
      const data = await response.json()
      setInsight(data.review)
    } catch (error) {
      setInsight("Keep pushing! Every small step counts.")
    } finally {
      setIsLoading(false)
    }
  }

  // Pehli baar modal khulne par fetch kare
  useEffect(() => {
    if (isModalOpen && safeHabit.title) {
      fetchAIInsight()
    }
  }, [isModalOpen, safeHabit.title])

  useEffect(() => {
    if (isModalOpen) {
      gsap.to(overlayRef.current, { opacity: 1, pointerEvents: "auto", duration: 0.3 })
      gsap.fromTo(sheetRef.current, { x: "100%" }, { x: 0, duration: 0.5, ease: "power3.out" })
    } else {
      gsap.to(overlayRef.current, { opacity: 0, pointerEvents: "none", duration: 0.2 })
      gsap.to(sheetRef.current, { x: "100%", duration: 0.4, ease: "power3.in" })
    }
  }, [isModalOpen])

  return (
    <>
      <div ref={overlayRef} onClick={closeHabitModal} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md opacity-0 pointer-events-none" />

      <div ref={sheetRef} className="fixed right-0 top-0 z-50 h-[100dvh] w-full sm:w-[420px] bg-background shadow-2xl translate-x-full flex flex-col">
        {/* Header Section */}
        <header className="relative px-6 pt-6 pb-8 bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-600 text-white">
          <Button size="icon" variant="ghost" onClick={closeHabitModal} className="absolute left-4 top-4 rounded-full text-white hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="mt-6">
            <p className="text-[11px] tracking-widest uppercase opacity-80">Current Streak</p>
            <div className="flex items-center gap-2 mt-1">
              <Flame className="w-6 h-6 text-orange-300 fill-orange-300" />
              <span className="text-4xl font-black">{safeHabit.streak}</span>
            </div>
            <h2 className="mt-4 text-3xl font-black leading-tight">{safeHabit.title}</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
          <section className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 p-5 rounded-2xl relative">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-purple-600">
                <Sparkles className="w-4 h-4" />
                AI Insight
              </div>
              <button 
                onClick={fetchAIInsight} 
                disabled={isLoading}
                className="text-purple-400 hover:text-purple-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <p className="text-sm text-purple-900 leading-relaxed">
              {isLoading ? "Thinking..." : (
                <>
                  {/* You completed this habit <b>{completedThisMonth}</b> times this month.  */}
                  {insight}
                </>
              )}
            </p>
          </section>

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

          <section>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Reflection</p>
            <Textarea placeholder="What helped today? What didn’t?" className="min-h-[140px] rounded-2xl resize-none text-sm" />
          </section>
        </main>

        <footer className="p-5 border-t bg-background">
          <Button className="w-full h-14 rounded-2xl text-lg font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90">
            Save Progress
          </Button>
        </footer>
      </div>
    </>
  )
}