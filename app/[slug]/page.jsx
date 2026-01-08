"use client"
import Header from "@/components/Habits/Header"
import HabitDetailView from "./HabitDetailView" // Check file name
import { SessionProvider } from "next-auth/react"

export default async function HabitPage({ params }) {
  const { slug } = await params
  
  const habitData = {
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
    slug: slug
  }

  return (
    <main className="min-h-screen">
      <SessionProvider> <Header/></SessionProvider>
       <HabitDetailView habit={habitData} />
    </main>
  )
}