"use client"
import { motion } from "framer-motion"
import { LayoutDashboard, GraduationCap, BookOpen, PenTool } from "lucide-react"
import { useHabitDetail } from "@/app/context/HabitDetailContext"

const tabs = [
  { id: 'overview', label: 'overview', icon: LayoutDashboard },
  { id: 'learn', label: 'Learn', icon: GraduationCap },
  { id: 'vault', label: 'Vault', icon: BookOpen },
  { id: 'canvas', label: 'Canvas', icon: PenTool },
]

export default function HabitModalNav() {
  const { activeTab, setActiveTab } = useHabitDetail()

  return (
    <nav className="flex items-center justify-between bg-zinc-100/50 backdrop-blur-md p-1.5 rounded-[24px] mb-8 border border-zinc-200/50 sticky top-0 z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 flex flex-col items-center justify-center py-3 rounded-[20px] transition-all ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`}
          >
            {isActive && (
              <motion.div layoutId="pill" className="absolute inset-0 bg-white shadow-sm border border-zinc-100 rounded-[20px]" />
            )}
            <Icon className={`w-4 h-4 mb-1 relative z-10 ${isActive ? 'text-purple-600' : ''}`} />
            <span className="text-[9px] font-black uppercase relative z-10">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}