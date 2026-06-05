import React from 'react';
import { useVisualizationStore } from '../../store/useVisualizationStore';
import { useRecommendationStore } from '../../store/useRecommendationStore';
import { useAppStore } from '../../store/useAppStore';

const LAYERS = [
  { key: 'showHeatmap', label: 'Heatmap', icon: '◐', color: '#7C3AED' },
  { key: 'showVectors', label: 'Vectors', icon: '⬡', color: '#00E5FF' },
  { key: 'showTrajectory', label: 'Trajectory', icon: '〰', color: '#39D353' },
  { key: 'showBubble', label: 'Bubble', icon: '◎', color: '#FF4757' },
];

const SETTER_MAP = {
  showHeatmap: 'setShowHeatmap',
  showVectors: 'setShowVectors',
  showTrajectory: 'setShowTrajectory',
  showBubble: 'setShowBubble',
};

// Mutually exclusive field visualisation modes
const FIELD_MODES = [
  { value: 'off',         label: 'OFF',         icon: '—'  },
  { value: 'direction',   label: 'SLOPE FIELD',  icon: '⊟'  },
  { value: 'force',       label: 'FORCE FIELD',  icon: '⤢'  },
  { value: 'streamlines', label: 'STREAMLINES',  icon: '〜' },
];

const ControlPanel = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const vizStore = useVisualizationStore();
  const setScene = useAppStore((s) => s.setScene);

  const handleToggle = (key) => {
    const setter = SETTER_MAP[key];
    if (setter && vizStore[setter]) {
      vizStore[setter](!vizStore[key]);
    }
  };

  const handlePerturb = () => {
    if (vizStore.perturbationActive) return;
    
    const userPos = vizStore.userPos;
    vizStore.setPerturbationActive(true);
    vizStore.setPerturbationRing({
      x: userPos.x,
      y: userPos.y,
      radius: 0,
      alpha: 1,
    });

    // Auto-timeout perturbation state after 3s
    setTimeout(() => {
      vizStore.setPerturbationActive(false);
      vizStore.setPerturbationRing(null);
    }, 3000);
  };

  const handleCompare = () => {
    if (vizStore.ghostUser !== null) {
      vizStore.setGhostUser(null);
    } else {
      const userPos = vizStore.userPos;
      // Spawn twin at opposite corner
      const gx = userPos.x > 0.5 ? 0.1 : 0.9;
      const gy = userPos.y > 0.5 ? 0.1 : 0.9;
      
      const userVector = useRecommendationStore.getState().userVector;
      const invertedVector = userVector.map((v) => 1.0 - v);
      
      vizStore.setGhostUser({
        pos: { x: gx, y: gy },
        velocity: { x: 0, y: 0 },
        trajectory: [],
        vector: invertedVector,
      });
    }
  };

  const handleReset = () => {
    const userPos = vizStore.userPos;
    vizStore.resetVisualizationStore();
    useRecommendationStore.getState().resetUserVector();
    
    // Begin eased centering animation
    vizStore.setResetState({
      active: true,
      startPos: { ...userPos },
      progress: 0,
    });
  };

  if (isCollapsed) {
    return (
      <button 
        type="button"
        className="control-panel--collapsed-trigger"
        onClick={() => setIsCollapsed(false)}
        title="Expand Controls"
        style={{
          position: 'absolute',
          top: '60px',
          right: '16px',
          zIndex: 20,
          background: 'rgba(6, 8, 13, 0.85)',
          border: 'var(--border-subtle)',
          color: 'var(--text-secondary)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          transition: 'all 0.2s ease'
        }}
      >
        <span>⚙️</span>
        <span>EXPAND CONTROLS</span>
      </button>
    );
  }

  return (
    <div className="control-panel">
      {/* Collapse header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        paddingBottom: '6px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--accent-cyan)',
          letterSpacing: '0.1em',
          fontWeight: 'bold'
        }}>CONTROLS</span>
        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            padding: '2px 6px',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Minimize Panel"
        >
          —
        </button>
      </div>
      {/* Field Visualisation Mode — mutually exclusive radio group */}
      <div className="control-panel__section">
        <div className="control-panel__header">
          <span className="control-panel__title">FIELD MODE</span>
        </div>
        <div className="control-panel__field-modes">
          {FIELD_MODES.map(({ value, label, icon }) => {
            const active = vizStore.fieldMode === value;
            return (
              <button
                key={value}
                className={`control-panel__field-btn ${active ? 'control-panel__field-btn--active' : ''}`}
                onClick={() => vizStore.setFieldMode(value)}
                title={label}
              >
                <span className="control-panel__toggle-icon">{icon}</span>
                <span className="control-panel__toggle-label">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="control-panel__divider" />

      {/* Layers Section */}
      <div className="control-panel__section">
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
                style={{ '--toggle-color': color }}
              >
                <span className="control-panel__toggle-icon">{icon}</span>
                <span className="control-panel__toggle-label">{label}</span>
                <span className={`control-panel__toggle-indicator ${active ? 'active' : ''}`} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="control-panel__divider" />

      {/* Speed Selector Section */}
      <div className="control-panel__section">
        <div className="control-panel__header">
          <span className="control-panel__title">SIMULATION SPEED</span>
        </div>
        <div className="control-panel__speed-row">
          {[1, 5, 20].map((speed) => (
            <button
              key={speed}
              className={`control-panel__speed-btn ${
                vizStore.simulationSpeed === speed ? 'control-panel__speed-btn--active' : ''
              }`}
              onClick={() => vizStore.setSimulationSpeed(speed)}
            >
              {speed}×
            </button>
          ))}
        </div>
      </div>

      <div className="control-panel__divider" />

      {/* Simulation Actions Section */}
      <div className="control-panel__section">
        <div className="control-panel__header">
          <span className="control-panel__title">DYNAMICS</span>
        </div>
        <div className="control-panel__actions">
          <button
            className={`control-panel__action-btn control-panel__action-btn--perturb ${
              vizStore.perturbationActive ? 'active' : ''
            }`}
            onClick={handlePerturb}
            disabled={vizStore.resetState.active}
          >
            ⚡ PERTURB
          </button>
          <button
            className={`control-panel__action-btn control-panel__action-btn--compare ${
              vizStore.ghostUser !== null ? 'active' : ''
            }`}
            onClick={handleCompare}
            disabled={vizStore.resetState.active}
          >
            👥 {vizStore.ghostUser !== null ? 'REMOVE TWIN' : 'COMPARE'}
          </button>
          <button
            className="control-panel__action-btn control-panel__action-btn--reset"
            onClick={handleReset}
            disabled={vizStore.resetState.active}
          >
            ↺ RESET
          </button>
        </div>
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

