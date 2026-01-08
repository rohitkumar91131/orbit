"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { format, isSameDay } from "date-fns"
import { toast } from "sonner" 

const HabitContext = createContext(null)

export function HabitProvider({ children }) {
  const [date, setDate] = useState(new Date()) 
  const [habits, setHabits] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeHabit, setActiveHabit] = useState(null)

  // 1. Fetch Habits
  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch("/api/habits")
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      setHabits(data)
    } catch (e) {
      console.error("Error fetching habits:", e)
    }
  }, []) 

  // 2. Add Habit
  const addHabit = async (payload) => {
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to add habit")
      
      setHabits((prev) => [data, ...prev])
      return data
    } catch (e) {
      console.error(e)
      toast.error("Failed to add habit")
      throw e
    }
  }

  // 3. Update Habit
  const updateHabit = async (id, updatedData) => {
    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Update failed")

      setHabits((prev) => prev.map((h) => (h._id === id ? { ...h, ...data } : h)))
      toast.success("Habit updated")
    } catch (e) {
      console.error(e)
      toast.error("Update failed")
    }
  }

  // 4. Delete Habit
  const deleteHabit = async (id) => {
    try {
      setHabits((prev) => prev.filter((h) => h._id !== id))
      const res = await fetch(`/api/habits/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      toast.success("Habit deleted")
    } catch (e) {
      console.error(e)
      fetchHabits() // Revert
      toast.error("Delete failed")
    }
  }

  // 5. Toggle Habit (FIXED: URL sahi kar diya hai)
  const toggleHabit = async (id) => {
    const selectedDateStr = format(date, "yyyy-MM-dd")
    const oldHabits = [...habits]

    // 1. UI Update (Turant Tick dikhayega)
    setHabits((prev) =>
      prev.map((h) => {
        if (h._id !== id) return h
        const isDone = h.completedDates?.includes(selectedDateStr)
        const newDates = isDone
          ? h.completedDates.filter((d) => d !== selectedDateStr)
          : [...(h.completedDates || []), selectedDateStr]
        return { ...h, completedDates: newDates }
      })
    )

    try {
      // 2. API Call (URL Fixed: Ab '/toggle' nahi lagayenge)
      const res = await fetch(`/api/habits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDateStr }),
      })
      
      if (!res.ok) {
        throw new Error("Failed to toggle")
      }

      // 3. Success: Server ka data sync karo
      const data = await res.json()
      setHabits(prev => prev.map(h => 
        h._id === id ? { ...h, completedDates: data.completedDates, streak: data.newStreak } : h
      ))

    } catch (error) {
      console.error("Toggle error:", error)
      // 4. Error: Wapas purani state par le aao (Tick hata do)
      setHabits(oldHabits) 
      toast.error("Failed to update status")
    }
  }

  const setToday = () => setDate(new Date())
  const isSelectedDate = (compareDate) => isSameDay(date, compareDate)
  const openHabitModal = (habit) => { setActiveHabit(habit); setIsModalOpen(true) }
  const closeHabitModal = () => { setIsModalOpen(false); setTimeout(() => setActiveHabit(null), 400) }

  return (
    <HabitContext.Provider
      value={{
        date, setDate, setToday, isSelectedDate,
        habits, fetchHabits, addHabit, updateHabit, deleteHabit, toggleHabit,
        isModalOpen, activeHabit, openHabitModal, closeHabitModal,
      }}
    >
      {children}
    </HabitContext.Provider>
  )
}

export const useHabits = () => useContext(HabitContext)