"use client"
import HomePage from '@/components/HomePage/HomePage'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

function page() {
  return (
    <SessionProvider>
      <HomePage/>
    </SessionProvider>
  )
}

export default page
