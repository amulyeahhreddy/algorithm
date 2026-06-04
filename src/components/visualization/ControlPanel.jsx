/**
 * ControlPanel — Layer toggles and visualization controls
 * Allows toggling visibility of each canvas layer.
 */
import React from 'react';
import { useVisualizationStore } from '../../store/useVisualizationStore';
import { useAppStore } from '../../store/useAppStore';

const LAYERS = [
  { key: 'showHeatmap', label: 'Heatmap', icon: '◐', color: '#7C3AED' },
  { key: 'showVectors', label: 'Vectors', icon: '⬡', color: '#00E5FF' },
  { key: 'showForceField', label: 'Force Field', icon: '⤢', color: '#FFC107' },
  { key: 'showTrajectory', label: 'Trajectory', icon: '〰', color: '#39D353' },
  { key: 'showBubble', label: 'Bubble', icon: '◎', color: '#FF4757' },
];

const SETTER_MAP = {
  showHeatmap: 'setShowHeatmap',
  showVectors: 'setShowVectors',
  showForceField: 'setShowForceField',
  showTrajectory: 'setShowTrajectory',
  showBubble: 'setShowBubble',
};

const ControlPanel = () => {
  const vizStore = useVisualizationStore();
  const setScene = useAppStore((s) => s.setScene);

  const handleToggle = (key) => {
    const setter = SETTER_MAP[key];
    if (setter && vizStore[setter]) {
      vizStore[setter](!vizStore[key]);
    }
  };

  return (
    <div className="control-panel">
      <div className="control-panel__header">
        <span className="control-panel__title">LAYERS</span>
      </div>

      <div className="control-panel__layers">
        {LAYERS.map(({ key, label, icon, color }) => {
          const active = vizStore[key];
          return (
            <button
              key={key}
              className={`control-panel__toggle ${active ? 'control-panel__toggle--active' : ''}`}
              onClick={() => handleToggle(key)}
              style={{
                '--toggle-color': color,
              }}
            >
              <span className="control-panel__toggle-icon">{icon}</span>
              <span className="control-panel__toggle-label">{label}</span>
              <span className={`control-panel__toggle-indicator ${active ? 'active' : ''}`} />
            </button>
          );
        })}
      </div>

      <div className="control-panel__divider" />

      <button
        className="control-panel__back-btn"
        onClick={() => setScene('feed')}
      >
        ← BACK TO FEED
      </button>
    </div>
  );
};

export default ControlPanel;
