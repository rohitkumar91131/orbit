"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { format, subDays, isSameDay } from "date-fns"
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
      
      const formattedData = data.map(habit => ({
        ...habit,
        logs: habit.logs || [], // IMPORTANT: Logs ko preserve karo!
        completedDates: habit.logs ? habit.logs.map(log => log.date) : []
      }))

      setHabits(formattedData)
    } catch (e) {
      console.error("Error fetching habits:", e)
    }
  }, [])

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

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
      
      setHabits((prev) => [...prev, { ...data, completedDates: [], logs: [] }])
      return data
    } catch (e) {
      console.error(e)
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

      setHabits((prev) => prev.map((h) => (h._id === id ? { ...data, completedDates: h.completedDates, logs: h.logs } : h)))
      return data
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  // 4. Delete Habit (Pura Habit Delete)
  const deleteHabit = async (id) => {
    try {
      const res = await fetch(`/api/habits/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      
      setHabits((prev) => prev.filter((h) => h._id !== id))
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  // 5. Toggle Habit
  const toggleHabit = async (id) => {
    const selectedDateStr = format(date, "yyyy-MM-dd")

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
      await fetch(`/api/habits/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDateStr }),
      })
      // fetchHabits() call karne ki zaroorat nahi agar optimistic update sahi hai
    } catch (error) {
      console.error("Toggle error:", error)
      fetchHabits() // Error aane par revert karo
    }
  }

  // 6. Save Journal
  const saveJournal = async (habitId, journalText) => {
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

      setHabits(prev => prev.map(h => {
        if(h._id !== habitId) return h;
        
        const existingLogIndex = h.logs.findIndex(l => l.date === selectedDateStr)
        let newLogs = [...h.logs]
        
        if(existingLogIndex > -1) {
            newLogs[existingLogIndex] = { ...newLogs[existingLogIndex], journal: journalText }
        } else {
            newLogs.push(log) 
        }
        
        return { ...h, logs: newLogs }
      }))

      toast.success("Journal saved")
    } catch (error) {
      console.error(error)
      toast.error("Could not save journal")
    }
  }

  // 7. Delete Log (Sirf us din ka data reset)
  const deleteHabitLog = async (habitId) => {
    const selectedDateStr = format(date, "yyyy-MM-dd")

    try {
      const res = await fetch(`/api/habits/${habitId}/log`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDateStr }),
      })

      if (!res.ok) throw new Error("Failed to delete log")
      
      const data = await res.json()

      setHabits((prev) => 
        prev.map((h) => {
          if (h._id !== habitId) return h
          
          return {
            ...h,
            streak: data.newStreak !== undefined ? data.newStreak : h.streak,
            logs: h.logs.filter(l => l.date !== selectedDateStr),
            completedDates: h.completedDates.filter(d => d !== selectedDateStr)
          }
        })
      )
      
      toast.success("Entry cleared for today")
      
      // Update Active Habit for Modal
      if (activeHabit && activeHabit._id === habitId) {
        setActiveHabit(prev => ({
            ...prev, 
            logs: prev.logs.filter(l => l.date !== selectedDateStr)
        }))
      }

    } catch (error) {
      console.error(error)
      toast.error("Could not clear entry")
    }
  }

  // 8. Helpers (Jo miss ho gaye the)
  const calculateStreak = (completedDates) => {
    if (!completedDates || completedDates.length === 0) return 0
    let streak = 0
    let checkDate = new Date()
    
    for (let i = 0; i < 365; i++) {
      const dateStr = format(checkDate, "yyyy-MM-dd")
      if (completedDates.includes(dateStr)) {
        streak++
        checkDate = subDays(checkDate, 1)
      } else {
        if (i === 0 && !completedDates.includes(dateStr)) {
          checkDate = subDays(checkDate, 1)
          continue
        }
        break
      }
    }
    return streak
  }

  // Define setToday explicitly
  const setToday = () => setDate(new Date())

  // Define isSelectedDate explicitly
  const isSelectedDate = (compareDate) => isSameDay(date, compareDate)

  const openHabitModal = (habit) => { setActiveHabit(habit); setIsModalOpen(true) }
  const closeHabitModal = () => { setIsModalOpen(false); setTimeout(() => setActiveHabit(null), 400) }

  return (
    <HabitContext.Provider
      value={{
        date,
        setDate,
        setToday,       // Ab ye defined hai
        isSelectedDate, // Ye bhi defined hai
        habits,
        fetchHabits,
        addHabit,
        updateHabit,
        deleteHabit,
        deleteHabitLog,
        toggleHabit,
        saveJournal,
        calculateStreak,
        isModalOpen,
        activeHabit,
        openHabitModal,
        closeHabitModal,
      }}
    >
      {children}
    </HabitContext.Provider>
  )
}

export const useHabits = () => useContext(HabitContext)