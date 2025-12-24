"use client"

import React, { useEffect, useRef } from 'react'

const DotWaveBackground = () => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const mouse = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let dots = []
    const spacing = 30

    const createDots = () => {
      if (!canvas) return
      dots.length = 0
      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          dots.push({ 
            x, y, 
            baseX: x, baseY: y, 
            phase: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 1.5 
          })
        }
      }
    }

    const resizeCanvas = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth
        canvas.height = containerRef.current.clientHeight
        createDots() 
      }
    }

    const updateMouseCoords = (e) => {
      const rect = canvas.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      mouse.current = { x: clientX - rect.left, y: clientY - rect.top }
    }

    const resetMouseCoords = () => {
      mouse.current = { x: -1000, y: -1000 }
    }

    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('mousemove', updateMouseCoords)
    window.addEventListener('touchstart', updateMouseCoords)
    window.addEventListener('touchmove', updateMouseCoords)
    window.addEventListener('touchend', resetMouseCoords)
    
    resizeCanvas() 

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      dots.forEach(dot => {
        const shimmer = (Math.sin((time / 1000) * dot.speed + dot.phase) + 1) / 2
        const wave = Math.sin((time / 1500) + (dot.baseX / 250) + (dot.baseY / 250)) * 6
        
        const dx = mouse.current.x - dot.baseX
        const dy = mouse.current.y - (dot.baseY + wave)
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxInteractionDist = 120

        let offsetX = 0, offsetY = 0
        if (distance < maxInteractionDist) {
          const force = (maxInteractionDist - distance) / maxInteractionDist
          offsetX = (dx / distance) * force * -20
          offsetY = (dy / distance) * force * -20
        }

        ctx.fillStyle = distance < maxInteractionDist 
          ? `rgba(168, 85, 247, ${0.4 + shimmer * 0.6})` 
          : `rgba(209, 213, 223, ${0.1 + shimmer * 0.4})`
        
        ctx.beginPath()
        ctx.arc(dot.baseX + offsetX, dot.baseY + wave + offsetY, 1.5, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate(0)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', updateMouseCoords)
      window.removeEventListener('touchstart', updateMouseCoords)
      window.removeEventListener('touchmove', updateMouseCoords)
      window.removeEventListener('touchend', resetMouseCoords)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 bg-white pointer-events-none">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  )
}

export default DotWaveBackground