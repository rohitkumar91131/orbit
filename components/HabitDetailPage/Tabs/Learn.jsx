"use client"
import { useHabitDetail } from "@/app/context/HabitDetailContext"
import { PlayCircle, ExternalLink } from "lucide-react"

export default function Learn() {
  const { habit } = useHabitDetail()
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="space-y-4">
        <label className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Suggested for {habit?.title}</label>
        
        {/* Placeholder for YouTube Iframe */}
        <div className="aspect-video bg-zinc-100 rounded-[32px] flex items-center justify-center border-2 border-dashed border-zinc-200">
          <div className="text-center">
            <PlayCircle className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-zinc-400">YouTube Embed Logic here</p>
          </div>
        </div>

        {/* Link Card */}
        <div className="p-5 bg-white border border-zinc-100 rounded-[28px] shadow-sm flex items-center justify-between group cursor-pointer hover:border-purple-200 transition-all">
          <div>
            <p className="text-xs font-black uppercase text-zinc-400 tracking-tighter">Article</p>
            <h5 className="font-bold text-zinc-900">How to master {habit?.title} in 30 days</h5>
          </div>
          <ExternalLink className="w-5 h-5 text-zinc-300 group-hover:text-purple-500 transition-all" />
        </div>
      </div>
    </div>
  )
}