'use client'

import React from 'react'

interface CustomLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

const CustomLink: React.FC<CustomLinkProps> = ({ href, children, className, onClick }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e)
      return
    }
    
    e.preventDefault()
    if (href.startsWith('/#') || href.startsWith('#')) {
      // ページ内リンクの場合
      const targetId = href.includes('/#') ? href.substring(2) : href.substring(1)
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // 通常のリンクの場合
      window.location.href = href
    }
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  )
}

export default CustomLink
