"use client"

import React, { useEffect, useRef } from 'react'
import * as LucideIcons from "lucide-react" 
import { motion } from "framer-motion"

const FinalCheckBackground = () => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const mouse = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    let animationFrameId
    
    const resize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth
        canvas.height = containerRef.current.clientHeight
      }
    }

    const updateCoords = (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
      mouse.current = { x, y }
    }

    window.addEventListener('resize', resize)
    resize()

    // Dot Settings
    const spacing = 30
    const dots = []
    for (let x = 0; x < 2000; x += spacing) {
      for (let y = 0; y < 2000; y += spacing) {
        dots.push({ 
          x, y, 
          baseX: x, baseY: y, 
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random()
        })
      }
    }

    const draw = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      dots.forEach(dot => {
        // Wave + Shimmer
        const shimmer = (Math.sin((time / 1000) * dot.speed + dot.phase) + 1) / 2
        const wave = Math.sin((time / 1000) + (dot.baseX / 200)) * 5
        
        // Interaction
        const dx = mouse.current.x - dot.baseX
        const dy = mouse.current.y - (dot.baseY + wave)
        const dist = Math.sqrt(dx*dx + dy*dy)
        let tx = 0, ty = 0
        
        if (dist < 120) {
          const force = (120 - dist) / 120
          tx = (dx / dist) * force * -20
          ty = (dy / dist) * force * -20
        }

        ctx.fillStyle = dist < 120 ? `rgba(168, 85, 247, 0.8)` : `rgba(209, 213, 223, ${0.1 + shimmer * 0.4})`
        ctx.beginPath()
        ctx.arc(dot.baseX + tx, dot.baseY + wave + ty, 1.5, 0, Math.PI * 2)
        ctx.fill()
      })
      animationFrameId = requestAnimationFrame(draw)
    }
    draw(0)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-white flex items-center justify-center overflow-hidden"
      onMouseMove={updateCoords}
      onTouchMove={updateCoords}
      onTouchStart={updateCoords}
    >
      {/* Background Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Center Icon */}
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 p-6 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-3xl shadow-2xl"
      >
        <LucideIcons.CheckCircle2 size={40} color="white" />
      </motion.div>
    </div>
  )
}

export default FinalCheckBackground