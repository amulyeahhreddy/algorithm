import React from 'react'

export const GlowText = ({ 
  children, 
  color = 'cyan', 
  size = 'md', 
  animate = true, 
  className = '', 
  ...props 
}) => {
  const classes = [
    'glow-text',
    `color-${color}`,
    `size-${size}`,
    animate ? 'animate-pulse' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}

export default GlowText
