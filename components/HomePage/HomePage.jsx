"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Loading from '@/components/Loading/Loading'
import HabitsWrapper from "@/components/Habits/HabiitsWrapper"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth")
    }
  }, [status, router])

  if (status === "loading") {
    return <Loading />
  }

  if (status === "authenticated") {
    return <HabitsWrapper />
  }

  return <Loading />
}