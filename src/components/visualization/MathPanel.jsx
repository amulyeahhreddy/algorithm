/**
 * MathPanel — Live equations display panel
 * Shows real-time mathematical state: user vector, similarity equation,
 * force equation, and current dynamics values.
 */
import React from 'react';
import { useVisualizationStore } from '../../store/useVisualizationStore';
import { useRecommendationStore } from '../../store/useRecommendationStore';

const DIMENSION_LABELS = ['HMR', 'ENG', 'KNW', 'MUS', 'SPT', 'LIF'];
const DIMENSION_COLORS = ['#FF4757', '#7C3AED', '#00E5FF', '#39D353', '#FFC107', '#FF6B9D'];

const MathPanel = () => {
  const userPos = useVisualizationStore((s) => s.userPos);
  const userVelocity = useVisualizationStore((s) => s.userVelocity);
  const explorationNoise = useVisualizationStore((s) => s.explorationNoise);
  const filterBubble = useVisualizationStore((s) => s.filterBubble);
  const trajectory = useVisualizationStore((s) => s.trajectory);
  const userVector = useRecommendationStore((s) => s.userVector);
  const recommendationForce = useVisualizationStore((s) => s.recommendationForce || { x: 0, y: 0 });

  const vMag = Math.sqrt(
    (userVelocity?.x || 0) ** 2 + (userVelocity?.y || 0) ** 2
  ).toFixed(5);

  const dxdt = userVelocity?.x || 0;
  const dydt = userVelocity?.y || 0;
  const fMag = Math.sqrt(recommendationForce.x ** 2 + recommendationForce.y ** 2);
  const epsilon = explorationNoise;

  return (
    <div className="math-panel">
      <div className="math-panel__header">
        <span className="math-panel__icon">∑</span>
        <span className="math-panel__title">SYSTEM STATE</span>
        <span className="math-panel__live-dot" />
      </div>

      {/* User Vector */}
      <div className="math-panel__section">
        <div className="math-panel__label">û — user preference vector</div>
        <div className="math-panel__vector-row">
          {userVector.map((v, i) => (
            <div key={i} className="math-panel__vector-cell">
              <div
                className="math-panel__vector-bar"
                style={{
                  height: `${v * 100}%`,
                  backgroundColor: DIMENSION_COLORS[i],
                  opacity: 0.4 + v * 0.6,
                }}
              />
              <span className="math-panel__vector-val">{v.toFixed(2)}</span>
              <span className="math-panel__vector-label" style={{ color: DIMENSION_COLORS[i] }}>
                {DIMENSION_LABELS[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Similarity Equation */}
      <div className="math-panel__section">
        <div className="math-panel__label">similarity function</div>
        <div className="math-panel__equation">
          <span className="math-panel__eq-fn">cos(θ)</span> = 
          <span className="math-panel__eq-frac">
            <span className="math-panel__eq-num">û · ĉᵢ</span>
            <span className="math-panel__eq-den">‖û‖ · ‖ĉᵢ‖</span>
          </span>
        </div>
      </div>

      {/* Force Equation */}
      <div className="math-panel__section">
        <div className="math-panel__label">recommendation force</div>
        <div className="math-panel__equation">
          <span className="math-panel__eq-fn">F</span> = Σᵢ wᵢ × (cᵢ − x)
        </div>
      </div>

      {/* Dynamics */}
      <div className="math-panel__section math-panel__section--grid">
        <div className="math-panel__stat">
          <span className="math-panel__stat-label">position</span>
          <span className="math-panel__stat-value">
            ({userPos.x.toFixed(3)}, {userPos.y.toFixed(3)})
          </span>
        </div>
        <div className="math-panel__stat">
          <span className="math-panel__stat-label">|v|</span>
          <span className="math-panel__stat-value">{vMag}</span>
        </div>
        <div className="math-panel__stat">
          <span className="math-panel__stat-label">noise σ</span>
          <span className="math-panel__stat-value">{explorationNoise.toFixed(4)}</span>
        </div>
        <div className="math-panel__stat">
          <span className="math-panel__stat-label">trajectory</span>
          <span className="math-panel__stat-value">{trajectory.length} pts</span>
        </div>
        <div className="math-panel__stat">
          <span className="math-panel__stat-label">bubble</span>
          <span
            className="math-panel__stat-value"
            style={{ color: filterBubble.active ? '#FF4757' : '#39D353' }}
          >
            {filterBubble.active ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
        {filterBubble.active && (
          <div className="math-panel__stat">
            <span className="math-panel__stat-label">strength</span>
            <span className="math-panel__stat-value" style={{ color: '#FF4757' }}>
              {((filterBubble.strength || 0) * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      <div className="math-panel__divider" />

      {/* ODE Dynamics */}
      <div className="math-panel__section">
        <div className="math-panel__label">ODE Differential Rates</div>
        <div className="math-panel__ode-grid">
          <div className="math-panel__ode-item">
            <span className="math-panel__ode-label">dx/dt</span>
            <span className={`math-panel__ode-val ${dxdt > 0.0001 ? 'pos' : dxdt < -0.0001 ? 'neg' : ''}`}>
              {dxdt >= 0.0001 ? '+' : ''}{dxdt.toFixed(4)}
            </span>
          </div>
          <div className="math-panel__ode-item">
            <span className="math-panel__ode-label">dy/dt</span>
            <span className={`math-panel__ode-val ${dydt > 0.0001 ? 'pos' : dydt < -0.0001 ? 'neg' : ''}`}>
              {dydt >= 0.0001 ? '+' : ''}{dydt.toFixed(4)}
            </span>
          </div>
          <div className="math-panel__ode-item">
            <span className="math-panel__ode-label">|F_rec|</span>
            <span className="math-panel__ode-val val-force">
              {fMag.toFixed(4)}
            </span>
          </div>
          <div className="math-panel__ode-item">
            <span className="math-panel__ode-label">ε (noise)</span>
            <span className="math-panel__ode-val val-noise">
              {epsilon.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathPanel;

