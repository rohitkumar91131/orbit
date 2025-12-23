"use client"

import React from 'react'
import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"
import { CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

function Auth() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white selection:bg-purple-100">
      
      <div className="absolute inset-0 z-0 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 40, -20, 0], 
            y: [0, -50, 20, 0], 
            scale: [1, 1.2, 0.9, 1] 
          }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-[20%] left-[20%] w-96 h-96 bg-purple-200/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
        />
        <motion.div 
          animate={{ 
            x: [0, -30, 20, 0], 
            y: [0, 40, -40, 0], 
            scale: [1, 1.1, 0.9, 1] 
          }}
          transition={{ duration: 12, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          className="absolute top-[20%] right-[20%] w-96 h-96 bg-cyan-200/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
        />
        <motion.div 
          animate={{ 
            x: [0, 30, -30, 0], 
            y: [0, 20, -50, 0], 
            scale: [1, 0.9, 1.1, 1] 
          }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", delay: 2 }}
          className="absolute bottom-[20%] left-[35%] w-96 h-96 bg-pink-200/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 md:p-10 max-w-md w-full mx-4 text-center ring-1 ring-gray-100"
      >
        
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-16 h-16 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg mb-8"
        >
          <CheckCircle2 className="w-8 h-8 text-white" />
        </motion.div>

        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">
            Welcome to <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Orbit</span>
          </h1>
          <p className="text-gray-500 text-base">
            Your journey to better habits starts here.
          </p>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            variant="outline" 
            className="w-full h-14 text-lg font-medium bg-white hover:bg-gray-50 border-gray-200 text-gray-700 shadow-sm transition-all rounded-xl relative overflow-hidden group"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-gray-50/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <FcGoogle className="w-6 h-6 mr-3" />
            Continue with Google
          </Button>
        </motion.div>

        <div className="mt-8 pt-6 border-t border-gray-100/60">
          <p className="text-xs text-gray-400 font-medium">
            Protected by secure authentication.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Auth