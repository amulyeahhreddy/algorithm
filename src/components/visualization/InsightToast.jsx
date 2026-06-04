/**
 * InsightToast — Contextual insight notifications
 * Displays algorithmic insights based on current simulation state.
 * Toasts auto-cycle and can be dismissed.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useVisualizationStore } from '../../store/useVisualizationStore';
import { useRecommendationStore } from '../../store/useRecommendationStore';

const INSIGHTS = [
  {
    id: 'drift',
    condition: (viz) => {
      const len = viz.trajectory?.length || 0;
      if (len < 50) return false;
      const recent = viz.trajectory.slice(-20);
      const avgX = recent.reduce((s, p) => s + p.x, 0) / recent.length;
      const avgY = recent.reduce((s, p) => s + p.y, 0) / recent.length;
      const dx = avgX - 0.5;
      const dy = avgY - 0.5;
      return Math.sqrt(dx * dx + dy * dy) > 0.2;
    },
    icon: '🧭',
    title: 'PREFERENCE DRIFT DETECTED',
    message: 'Your position vector has drifted from center. The recommendation force is pulling you toward a content cluster.',
  },
  {
    id: 'bubble_warning',
    condition: (viz) => viz.filterBubble?.active === true,
    icon: '⚠️',
    title: 'FILTER BUBBLE FORMING',
    message: 'Over 62% of dwell time concentrated in one category. Exploration noise is being suppressed.',
  },
  {
    id: 'high_velocity',
    condition: (viz) => {
      const vx = viz.userVelocity?.x || 0;
      const vy = viz.userVelocity?.y || 0;
      return Math.sqrt(vx * vx + vy * vy) > 0.008;
    },
    icon: '⚡',
    title: 'HIGH VELOCITY STATE',
    message: 'Strong forces are actively redirecting your trajectory. The algorithm is confident about your preferences.',
  },
  {
    id: 'exploring',
    condition: (viz) => viz.explorationNoise > 0.006,
    icon: '🔍',
    title: 'EXPLORATION MODE',
    message: 'Noise parameter is high — the system is still exploring diverse content to map your preferences.',
  },
  {
    id: 'converging',
    condition: (viz) => viz.explorationNoise < 0.004,
    icon: '🎯',
    title: 'CONVERGENCE DETECTED',
    message: 'Exploration noise has collapsed. The algorithm has locked onto your preference profile.',
  },
];

const InsightToast = () => {
  const [activeInsight, setActiveInsight] = useState(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(new Set());
  const lastShownRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const checkInsights = () => {
      const vizState = useVisualizationStore.getState();

      for (const insight of INSIGHTS) {
        if (dismissed.has(insight.id)) continue;
        if (lastShownRef.current === insight.id) continue;

        try {
          if (insight.condition(vizState)) {
            setActiveInsight(insight);
            setVisible(true);
            lastShownRef.current = insight.id;

            // Auto-dismiss after 6 seconds
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
              setVisible(false);
              setTimeout(() => {
                setActiveInsight(null);
                lastShownRef.current = null;
              }, 400);
            }, 6000);

            return;
          }
        } catch {
          // Skip malformed conditions
        }
      }
    };

    const interval = setInterval(checkInsights, 3000);
    // Initial check after 2 seconds
    const initialTimer = setTimeout(checkInsights, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dismissed]);

  const handleDismiss = () => {
    if (activeInsight) {
      setDismissed((prev) => new Set(prev).add(activeInsight.id));
    }
    setVisible(false);
    setTimeout(() => setActiveInsight(null), 400);
  };

  if (!activeInsight) return null;

  return (
    <div className={`insight-toast ${visible ? 'insight-toast--visible' : 'insight-toast--hidden'}`}>
      <div className="insight-toast__icon">{activeInsight.icon}</div>
      <div className="insight-toast__content">
        <div className="insight-toast__title">{activeInsight.title}</div>
        <div className="insight-toast__message">{activeInsight.message}</div>
      </div>
      <button className="insight-toast__dismiss" onClick={handleDismiss}>×</button>
    </div>
  );
};

export default InsightToast;
