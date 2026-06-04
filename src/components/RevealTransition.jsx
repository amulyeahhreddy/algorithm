import React from 'react'

export const RevealTransition = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      flexDirection: 'column', 
      gap: '20px',
      position: 'relative',
      zIndex: 1
    }}>
      <h2 style={{ 
        fontFamily: 'var(--font-mono)', 
        color: 'var(--accent-violet)',
        letterSpacing: '0.1em'
      }}>
        REVEAL TRANSITION — PHASE 2
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
        Transition visual effects between the feed and the main math simulation will load here.
      </p>
    </div>
  )
}

export default RevealTransition
