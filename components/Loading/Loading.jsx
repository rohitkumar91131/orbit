"use client"

import React from "react"
import { CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import DotWaveBackground from "./DotWaveBackground"

const Loading = () => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-white overflow-hidden touch-none">
      <DotWaveBackground />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative z-10 w-24 h-24 overflow-hidden
        bg-gradient-to-tr from-purple-600 to-pink-500
        rounded-3xl flex items-center justify-center
        shadow-[0_25px_60px_rgba(168,85,247,0.4)]"
      >
        <CheckCircle2 className="w-12 h-12 text-white z-10" />

        <motion.div
          initial={{ x: "-150%" }}
          animate={{ x: "150%" }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
          className="absolute inset-0
          bg-gradient-to-r
          from-transparent via-white/40 to-transparent
          skew-x-12"
        />
      </motion.div>
    </div>
  )
}

export default Loading
