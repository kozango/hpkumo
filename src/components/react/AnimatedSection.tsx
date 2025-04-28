import { motion, HTMLMotionProps, MotionProps } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import React, { useState, useEffect, ReactNode } from 'react'

// HTMLMotionPropsとMotionPropsを組み合わせた型を定義
type CombinedMotionProps = HTMLMotionProps<"div"> & MotionProps

interface AnimatedSectionProps extends Omit<CombinedMotionProps, 'children'> {
  children: ReactNode
  delay?: number
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children, delay = 0, ...props }) => {
  const [mounted, setMounted] = useState(false)
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={mounted && inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedSection
