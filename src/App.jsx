import React, { useState, useEffect } from 'react'
import { useAppStore } from './store/useAppStore'
import GridBackground from './components/GridBackground'
import ScanlineOverlay from './components/ScanlineOverlay'
import FeedScene from './components/FeedScene'
import RevealTransition from './components/RevealTransition'
import VisualizationScene from './components/VisualizationScene'

function App() {
  const { scene, setScene } = useAppStore()
  const [isStarted, setIsStarted] = useState(false)

  const handleBegin = () => {
    setIsStarted(true)
    setScene('feed')
  }

  // 'V' keyboard shortcut to toggle between feed and visualization
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isStarted) return
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'v' || e.key === 'V') {
        const currentScene = useAppStore.getState().scene
        setScene(currentScene === 'visualization' ? 'feed' : 'visualization')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isStarted, setScene])

  return (
    <>
      {/* Background Layers */}
      <GridBackground />
      <ScanlineOverlay />

      {/* Main Scene Switcher / Routing */}
      {!isStarted ? (
        <div className="landing-container">
          <h1 className="landing-title">
            THE ALGORITHM
          </h1>
          <p className="landing-subtitle">
            Visualizing How Recommendation Systems Shape Reality
          </p>
          <button 
            type="button"
            className="begin-button"
            onClick={handleBegin}
          >
            Begin Experience
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative', zIndex: 10 }}>
          {scene === 'feed' && <FeedScene />}
          {scene === 'reveal' && <RevealTransition />}
          {scene === 'visualization' && <VisualizationScene />}
          
          {/* Persistent helper/scene-switcher at the bottom of active scenes, strictly for phase 1 validation */}
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px',
            background: 'var(--bg-surface)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'var(--border-default)',
            zIndex: 1000
          }}>
            <button 
              type="button"
              onClick={() => setScene('feed')}
              style={{
                background: scene === 'feed' ? 'var(--accent-cyan)' : 'transparent',
                color: scene === 'feed' ? 'var(--bg-void)' : 'var(--text-secondary)',
                border: 'none',
                padding: '4px 8px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              Feed
            </button>
            <button 
              type="button"
              onClick={() => setScene('reveal')}
              style={{
                background: scene === 'reveal' ? 'var(--accent-violet)' : 'transparent',
                color: scene === 'reveal' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                padding: '4px 8px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              Reveal
            </button>
            <button 
              type="button"
              onClick={() => setScene('visualization')}
              style={{
                background: scene === 'visualization' ? 'var(--accent-cyan)' : 'transparent',
                color: scene === 'visualization' ? 'var(--bg-void)' : 'var(--text-secondary)',
                border: 'none',
                padding: '4px 8px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              Visualization
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default App
