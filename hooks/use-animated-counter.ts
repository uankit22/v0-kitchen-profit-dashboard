"use client"

import { useState, useEffect } from "react"

export function useAnimatedCounter(end: number, duration = 2000, start = 0) {
  const [count, setCount] = useState(start)

  useEffect(() => {
    if (end === 0) {
      setCount(0)
      return
    }

    let startTime: number
    const startValue = start

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = Math.floor(startValue + (end - startValue) * easeOutQuart)

      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration, start])

  return count
}
