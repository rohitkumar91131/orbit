"use client"

import { useMemo } from "react"
import { Flame, Target, Calendar, Sparkles, Trash2, TrendingUp } from "lucide-react"
import { format, getDaysInMonth } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useHabitDetail } from "@/app/context/HabitDetailContext"

export default function Overview() {
  // Context se habit lo, agar nahi hai to dummy data use karo
  const { habit: contextHabit, saveJournal, deleteHabitLog } = useHabitDetail()

  // Dummy Data Fallback
  const habit = contextHabit || {
    _id: "1",
    title: "Morning Meditation",
    streak: 12,
    completedDates: ["2023-10-01", "2023-10-02"],
    logs: [{ date: format(new Date(), "yyyy-MM-dd"), journal: "Felt very calm today." }]
  }

  const todayDateStr = format(new Date(), "yyyy-MM-dd")

  // Stats Logic
  const daysInMonth = getDaysInMonth(new Date())
  const completedThisMonth = habit.completedDates?.filter(d => d.startsWith(format(new Date(), "yyyy-MM"))).length || 0
  const completionPercent = Math.round((completedThisMonth / daysInMonth) * 100) || 0

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-700">
      
      {/* 1. Header Card: Title & Main Streak */}
      <div className="relative overflow-hidden p-8 rounded-[32px] bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-xl">
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Active Habit</p>
            <h2 className="text-3xl font-black tracking-tight">{habit.title}</h2>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <Flame className="w-6 h-6 text-orange-400 fill-orange-400" />
              <span className="text-4xl font-black">{habit.streak}</span>
            </div>
            <p className="text-[10px] font-bold uppercase opacity-70">Day Streak</p>
          </div>
        </div>
        {/* Decorative Background Circle */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={<Target className="w-5 h-5 text-purple-600" />} 
          label="Monthly Hits" 
          value={`${completedThisMonth}/${daysInMonth}`} 
          subText="Target achieved"
        />
        <StatCard 
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} 
          label="Consistency" 
          value={`${completionPercent}%`} 
          subText="Avg. performance"
        />
      </div>

      {/* 3. AI Insight Section */}
      <div className="group p-6 bg-white border border-zinc-100 rounded-[32px] shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">AI Analysis</h4>
        </div>
        <p className="text-sm font-semibold text-zinc-700 leading-relaxed italic">
          "Bhai, tumhari consistency top-notch hai! Agar tum subah 10 baje ke pehle ise khatam kar lo, toh tumhari focus efficiency 15% aur badh sakti hai."
        </p>
      </div>

      {/* 4. Journal Section */}
      <div className="p-6 bg-zinc-50/50 border border-dashed border-zinc-200 rounded-[32px]">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Today's Notes</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => deleteHabitLog(habit._id)}
            className="h-8 text-red-500 hover:bg-red-50 rounded-full text-[10px] font-bold"
          >
            <Trash2 className="w-3 h-3 mr-1" /> CLEAR
          </Button>
        </div>
        <Textarea 
          placeholder="How was your session today?"
          className="bg-white border-none rounded-2xl min-h-[100px] shadow-sm focus-visible:ring-purple-500"
          defaultValue={habit.logs?.find(l => l.date === todayDateStr)?.journal || ""}
        />
        <Button 
          onClick={() => saveJournal(habit._id, "New Journal Entry")}
          className="w-full mt-4 rounded-2xl font-bold bg-zinc-900 hover:bg-zinc-800 text-white"
        >
          Update Journal
        </Button>
      </div>

    </div>
  )
}

function StatCard({ icon, label, value, subText }) {
  return (
    <div className="p-6 bg-white border border-zinc-100 rounded-[32px] shadow-sm">
      <div className="mb-3 p-2 w-fit bg-zinc-50 rounded-xl">{icon}</div>
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-zinc-900 my-1">{value}</p>
      <p className="text-[10px] text-zinc-400 font-medium">{subText}</p>
    </div>
  )
}