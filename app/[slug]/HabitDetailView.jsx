"use client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { HabitDetailProvider, useHabitDetail } from "@/app/context/HabitDetailContext"
import HabitModalNav from "./HabitModalNav"

function DetailBody() {
  const { renderTabContent, habitName } = useHabitDetail()

  return (
    // Sheet hata kar humne ek fixed full-screen div banaya hai
    <div className="fixed inset-0 z-50 bg-white flex flex-col h-screen w-screen overflow-hidden">
      {/* Header Section */}
      {/* Content Section */}
      <div className="flex-1 flex flex-col p-6 sm:p-10 overflow-hidden bg-white">
        <HabitModalNav />
        <ScrollArea className="flex-1">
          <div className="pb-20">
            {renderTabContent()}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default function HabitDetailView({ habit }) {
  return (
    <HabitDetailProvider habitName={habit.title}>
      <DetailBody />
    </HabitDetailProvider>
  )
}