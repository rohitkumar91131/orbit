import React from 'react'
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
// 1. Next.js ka Image component import karo
import Image from 'next/image'

async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth")
  }

  return (
    // 2. 'gap-6' add kiya spacing ke liye. 'h-screen' se full height center hai.
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-gray-50">
      
      {/* --- PROFILE IMAGE START --- */}
      {session.user?.image && (
        <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-lg ring-4 ring-purple-100">
          <Image
            src={session.user.image}
            alt={`${session.user.name}'s profile`}
            fill
            sizes="96px"
            className="object-cover"
            priority // Jaldi load karne ke liye
          />
        </div>
      )}
      {/* --- PROFILE IMAGE END --- */}

      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-gray-800">
          Welcome, <span className="text-purple-600">{session.user.name}</span>!
        </h1>
        <p className="text-gray-500 text-lg">
          {session.user.email}
        </p>
        <p className="text-sm text-gray-400 pt-2">
          You are successfully logged in.
        </p>
      </div>
      
    </div>
  )
}

export default HomePage