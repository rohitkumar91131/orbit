"use client"
import { useHabitDetail } from "@/app/context/HabitDetailContext"
import { Textarea } from "@/components/ui/textarea"

export default function Vault() {
  const { habit } = useHabitDetail()

  return (
    <div className="space-y-4 animate-in fade-in">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Knowledge Vault</label>
      <Textarea 
        placeholder="Aaj kya naya seekha? Write down your key takeaways..."
        className="min-h-[300px] bg-zinc-50 border-none rounded-[32px] p-8 text-base focus-visible:ring-purple-100 transition-all"
      />
    </div>
  )
}