/**
 * VisualizationScene — Full-screen mathematical visualization scene
 * Composes AlgorithmCanvas + MathPanel + ControlPanel + InsightToast
 */
import React from 'react';
import AlgorithmCanvas from './visualization/AlgorithmCanvas';
import MathPanel from './visualization/MathPanel';
import ControlPanel from './visualization/ControlPanel';
import InsightToast from './visualization/InsightToast';
import './visualization/Visualization.css';

export const VisualizationScene = () => {
  return (
    <div className="visualization-scene">
      {/* Title Bar */}
      <div className="visualization-scene__title-bar">
        <span className="visualization-scene__title-icon">◉</span>
        <span className="visualization-scene__title-text">
          THE ALGORITHM — <span>MATHEMATICAL VISUALIZATION</span>
        </span>
      </div>

      {/* Canvas Rendering Pipeline */}
      <AlgorithmCanvas />

      {/* Overlay UI */}
      <MathPanel />
      <ControlPanel />
      <InsightToast />

      {/* Keyboard shortcut hint */}
      <div className="keyboard-hint">
        <span className="keyboard-hint__key">V</span>
        <span className="keyboard-hint__text">toggle view</span>
      </div>
    </div>
  );
};

export default VisualizationScene;
