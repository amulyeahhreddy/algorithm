import React from 'react';
import { useRecommendationStore } from '../store/useRecommendationStore';
import { useVisualizationStore } from '../store/useVisualizationStore';

export const PhaseIndicator = () => {
  const interactions = useRecommendationStore((state) => state.interactions);
  const filterBubble = useVisualizationStore((state) => state.filterBubble);

  const count = interactions.length;
  let phaseText = 'BUILDING YOUR PROFILE';

  if (count >= 15 && filterBubble.active) {
    phaseText = 'FILTER BUBBLE FORMING';
  } else if (count >= 10) {
    phaseText = 'ALGORITHM ACTIVE';
  } else if (count >= 5) {
    phaseText = 'PATTERN FORMING';
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: '12px',
      left: '24px',
      fontFamily: 'var(--font-mono)',
      fontSize: '10px',
      color: 'var(--text-tertiary)',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      pointerEvents: 'none',
      zIndex: 20,
      transition: 'all 0.5s ease-in-out',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      opacity: 0.8
    }}>
      {/* Small pulsing indicator dot */}
      <span style={{
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        backgroundColor: count >= 10 ? 'var(--accent-cyan)' : 'var(--text-tertiary)',
        boxShadow: count >= 10 ? '0 0 6px var(--accent-cyan)' : 'none',
        display: 'inline-block'
      }} />
      {phaseText}
    </div>
  );
};

export default PhaseIndicator;
