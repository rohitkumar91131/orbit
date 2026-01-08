"use client"
import { createContext, useContext, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'

//Lazy loading components to save RAM
const Overview = dynamic(() => import('@/components/HabitDetailPage/Tabs/Overview'))
const Learn = dynamic(() => import('@/components/HabitDetailPage/Tabs/Learn'))
const Vault = dynamic(() => import('@/components/HabitDetailPage/Tabs/Vault'))
const Canvas = dynamic(() => import('@/components/HabitDetailPage/Tabs/Canvas'), { ssr: false })

const HabitDetailContext = createContext()

export function HabitDetailProvider({ children, habitName }) {
  const [activeTab, setActiveTab] = useState('overview')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview/>
      case 'learn': return <Learn />
      case 'vault': return <Vault />
      case 'canvas': return <Canvas />
      default: return <Overview />
    }
  }

  const value = useMemo(() => ({
    activeTab,
    setActiveTab,
    renderTabContent,
    habitName // Ye slug se aayega
  }), [activeTab, habitName])

  return (
    <HabitDetailContext.Provider value={value}>
      {children}
    </HabitDetailContext.Provider>
  )
}

export const useHabitDetail = () => useContext(HabitDetailContext)