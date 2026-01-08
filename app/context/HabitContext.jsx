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
  }, [habits]) 

  // 5. Toggle Habit
  const toggleHabit = useCallback(async (id) => {
    const selectedDateStr = format(date, "yyyy-MM-dd")
    const previousHabits = [...habits]

    // Optimistic UI Update
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
      const res = await fetch(`/api/habits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDateStr }),
      })
      
      if (!res.ok) throw new Error("Failed to toggle")
      const data = await res.json()
      
      // Sync with Server (Updates Streak & Dates)
      setHabits(prev => prev.map(h => 
        h._id === id ? { ...h, completedDates: data.completedDates, streak: data.newStreak } : h
      ))

    } catch (error) {
      console.error("Toggle error:", error)
      setHabits(previousHabits) 
      toast.error("Failed to update status")
    }
  }, [habits, date])

  // 6. Save Journal (NEW)
  const saveJournal = useCallback(async (habitId, journalText) => {
    const selectedDateStr = format(date, "yyyy-MM-dd")
    
    try {
      const res = await fetch(`/api/habits/${habitId}/log`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            date: selectedDateStr, 
            journal: journalText 
        }),
      })
      
      if(!res.ok) throw new Error("Failed to save")
      
      const { log } = await res.json()

      // Update Habits List
      setHabits(prev => prev.map(h => {
        if(h._id !== habitId) return h;
        
        // Logs array update logic
        const existingLogIndex = (h.logs || []).findIndex(l => l.date === selectedDateStr)
        let newLogs = [...(h.logs || [])]
        
        if(existingLogIndex > -1) {
            newLogs[existingLogIndex] = { ...newLogs[existingLogIndex], journal: journalText }
        } else {
            newLogs.push(log) 
        }
        
        // Sync Active Habit if open
        if(activeHabit && activeHabit._id === habitId) {
            setActiveHabit(curr => ({...curr, logs: newLogs}))
        }

        return { ...h, logs: newLogs }
      }))

      toast.success("Journal saved")
    } catch (error) {
      console.error(error)
      toast.error("Could not save journal")
    }
  }, [date, activeHabit])

  // 7. Delete Log (NEW)
  const deleteHabitLog = useCallback(async (habitId) => {
    const selectedDateStr = format(date, "yyyy-MM-dd")

    try {
      const res = await fetch(`/api/habits/${habitId}/log`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDateStr }),
      })

      if (!res.ok) throw new Error("Failed to delete log")
      
      const data = await res.json() // returns { newStreak, message }

      // Update Habits List
      setHabits((prev) => 
        prev.map((h) => {
          if (h._id !== habitId) return h
          
          const updatedLogs = (h.logs || []).filter(l => l.date !== selectedDateStr)
          const updatedDates = h.completedDates.filter(d => d !== selectedDateStr)

          // Sync Active Habit if open
          if(activeHabit && activeHabit._id === habitId) {
            setActiveHabit(curr => ({
                ...curr, 
                streak: data.newStreak,
                logs: updatedLogs,
                completedDates: updatedDates
            }))
          }

          return {
            ...h,
            streak: data.newStreak,
            logs: updatedLogs,
            completedDates: updatedDates
          }
        })
      )
      
      toast.success("Entry cleared for today")

    } catch (error) {
      console.error(error)
      toast.error("Could not clear entry")
    }
  }, [date, activeHabit])


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

  // --- MEMOIZED VALUE ---
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
    saveJournal,     // Added
    deleteHabitLog,  // Added
    
    // Helpers
    setToday,
    isSelectedDate,
    openHabitModal,
    closeHabitModal
  }), [
    date, habits, isModalOpen, activeHabit, 
    fetchHabits, addHabit, updateHabit, deleteHabit, toggleHabit, saveJournal, deleteHabitLog,
    setToday, isSelectedDate, openHabitModal, closeHabitModal
  ])

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  )
}

export const useHabits = () => useContext(HabitContext)