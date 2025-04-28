'use client'

import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AnimationProvider } from "../../contexts/AnimationContext"

interface ClientLayoutProps {
  children: React.ReactNode
  currentPath: string
}

export default function ClientLayout({ children, currentPath }: ClientLayoutProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0)
    }
  }, [currentPath])

  return (
    <AnimationProvider>
      <AnimatePresence mode="wait">
        <motion.main
          key={currentPath}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </AnimationProvider>
  )
}
