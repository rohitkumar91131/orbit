"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { format } from "date-fns"

const HabitContext = createContext(null)

export function HabitProvider({ children }) {
  const [date, setDate] = useState(new Date())
  const [habits, setHabits] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeHabit, setActiveHabit] = useState(null)

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

  const openHabitModal = (habit) => {
    setActiveHabit(habit)
    setIsModalOpen(true)
  }

  const closeHabitModal = () => {
    setIsModalOpen(false)
    // We don't null activeHabit immediately to avoid "flicker" during GSAP exit animation
    setTimeout(() => setActiveHabit(null), 400) 
  }

  const toggleHabit = async (id) => {
    const todayStr = format(date, "yyyy-MM-dd")

    // Optimistic Update
    setHabits(prev =>
      prev.map(h => {
        if (h._id !== id) return h
        const isDone = h.completedDates?.includes(todayStr)
        const newDates = isDone
          ? h.completedDates.filter(d => d !== todayStr)
          : [...(h.completedDates || []), todayStr]
        return { ...h, completedDates: newDates }
      })
    )

    await fetch(`/api/habits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: todayStr }),
    })
  }

  return (
    <HabitContext.Provider
      value={{
        date,
        setDate,
        habits,
        fetchHabits,
        toggleHabit,
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

export const useHabits = () => {
  const context = useContext(HabitContext)
  if (!context) throw new Error("useHabits must be used within a HabitProvider")
  return context
}