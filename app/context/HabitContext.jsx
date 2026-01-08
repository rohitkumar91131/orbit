"use client"

import { createContext, useContext, useState, useCallback, useMemo } from "react"
import { format, isSameDay } from "date-fns"
import { toast } from "sonner" 

const HabitContext = createContext(null)

export function HabitProvider({ children }) {
  // --- State ---
  const [date, setDate] = useState(new Date()) 
  const [habits, setHabits] = useState([])
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeHabit, setActiveHabit] = useState(null)

  // --- Actions ---

  // 1. Fetch Habits (Memoized)
  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch("/api/habits")
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      setHabits(data)
    } catch (e) {
      console.error("Error fetching habits:", e)
      toast.error("Could not load habits")
    }
  }, []) 

  // 2. Add Habit
  const addHabit = useCallback(async (payload) => {
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || "Failed to add habit")
      
      // Update State
      setHabits((prev) => [data, ...prev])
      return data
    } catch (e) {
      console.error(e)
      toast.error("Failed to add habit")
      throw e
    }
  }, [])

  // 3. Update Habit
  const updateHabit = useCallback(async (id, updatedData) => {
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
  }, [])

  // 4. Delete Habit
  const deleteHabit = useCallback(async (id) => {
    // Optimistic Delete
    const previousHabits = [...habits]
    setHabits((prev) => prev.filter((h) => h._id !== id))

    try {
      const res = await fetch(`/api/habits/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      toast.success("Habit deleted")
    } catch (e) {
      console.error(e)
      setHabits(previousHabits) // Revert on fail
      toast.error("Delete failed")
    }
  }, [habits]) // Depends on habits for snapshot

  // 5. Toggle Habit
  const toggleHabit = useCallback(async (id) => {
    const selectedDateStr = format(date, "yyyy-MM-dd")
    
    // Create a snapshot for reverting if API fails
    const previousHabits = [...habits]

    // 1. Optimistic UI Update
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
      // 2. API Call
      const res = await fetch(`/api/habits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDateStr }),
      })
      
      if (!res.ok) throw new Error("Failed to toggle")

      const data = await res.json()
      
      // 3. Sync with Server (Updates Streak & Dates)
      setHabits(prev => prev.map(h => 
        h._id === id ? { ...h, completedDates: data.completedDates, streak: data.newStreak } : h
      ))

    } catch (error) {
      console.error("Toggle error:", error)
      setHabits(previousHabits) // 4. Revert to snapshot
      toast.error("Failed to update status")
    }
  }, [habits, date]) // Re-create function if habits or date changes

  // --- Helpers ---
  const setToday = useCallback(() => setDate(new Date()), [])
  
  const isSelectedDate = useCallback((compareDate) => {
    return isSameDay(date, compareDate)
  }, [date])

  const openHabitModal = useCallback((habit) => { 
    setActiveHabit(habit)
    setIsModalOpen(true) 
  }, [])

  const closeHabitModal = useCallback(() => { 
    setIsModalOpen(false)
    setTimeout(() => setActiveHabit(null), 400) 
  }, [])

  // --- MEMOIZED VALUE (Prevents Unnecessary Re-renders) ---
  const value = useMemo(() => ({
    // State
    date,
    habits,
    isModalOpen,
    activeHabit,
    
    // Setters
    setDate,
    
    // Actions
    fetchHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    
    // Helpers
    setToday,
    isSelectedDate,
    openHabitModal,
    closeHabitModal
  }), [
    date, habits, isModalOpen, activeHabit, // Data
    fetchHabits, addHabit, updateHabit, deleteHabit, toggleHabit, // Functions
    setToday, isSelectedDate, openHabitModal, closeHabitModal // Helpers
  ])

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  )
}

export const useHabits = () => useContext(HabitContext)