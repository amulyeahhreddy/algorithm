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
        </div>
      )}
    </>
  )
}

export default App
