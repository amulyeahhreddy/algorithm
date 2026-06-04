import React, { useState } from 'react';
import { useRecommendationStore } from '../store/useRecommendationStore';
import VectorDisplay from './VectorDisplay';

export const AlgorithmHUD = () => {
  const userVector = useRecommendationStore((state) => state.userVector);
  const [isHovered, setIsHovered] = useState(false);

  const dimensionLabels = [
    'Humor / Satire',
    'Drama / Narrative',
    'Education / Knowledge',
    'Sonic / Music',
    'Action / Physical',
    'Lifestyle / Aesthetic'
  ];

  return (
    <div 
      className="algorithm-hud"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered((prev) => !prev)}
    >
      {/* Pill header */}
      <div className="hud-pill">
        <span className="hud-dot" />
        <span>⬡ ANALYZING USER VECTOR</span>
      </div>

      {/* Hover Panel displaying live weights */}
      {isHovered && (
        <div className="hud-panel">
          <h4 className="hud-panel-title">User Vector Embeddings</h4>
          {userVector.map((val, idx) => (
            <div key={idx} className="hud-vector-row">
              <div className="hud-vector-label">
                <span>{dimensionLabels[idx]}</span>
                <span className="hud-vector-value">{(val * 100).toFixed(0)}%</span>
              </div>
              <div className="hud-bar-bg">
                <div 
                  className="hud-bar-fill"
                  style={{ width: `${val * 100}%` }}
                />
              </div>
            </div>
          ))}
          {/* Labeled height-proportional charts display */}
          <VectorDisplay />
        </div>
      )}
    </div>
  );
};

export default AlgorithmHUD;
