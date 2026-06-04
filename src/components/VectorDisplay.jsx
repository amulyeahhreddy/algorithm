import React from 'react';
import { useRecommendationStore } from '../store/useRecommendationStore';

export const VectorDisplay = () => {
  const userVector = useRecommendationStore((state) => state.userVector);

  const dimensions = [
    { label: 'HUM', color: 'var(--accent-coral)' },
    { label: 'DRA', color: '#B5179E' }, // Custom narrative color
    { label: 'EDU', color: 'var(--accent-violet)' },
    { label: 'MUS', color: 'var(--accent-cyan)' },
    { label: 'ACT', color: 'var(--accent-lime)' },
    { label: 'LIF', color: 'var(--accent-amber)' }
  ];

  // Dominant index
  const dominantIdx = userVector.indexOf(Math.max(...userVector));

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: '80px',
      padding: '10px 0 0 0',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      marginTop: '10px',
      gap: '6px'
    }}>
      {userVector.map((val, idx) => {
        const dim = dimensions[idx];
        const heightPercent = Math.max(8, val * 100); // minimum height for visibility
        const isDominant = idx === dominantIdx;

        return (
          <div 
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              gap: '6px',
              height: '100%',
              justifyContent: 'flex-end'
            }}
          >
            {/* Height Bar */}
            <div style={{
              width: '10px',
              height: `${heightPercent}%`,
              backgroundColor: dim.color,
              borderRadius: '2px',
              boxShadow: isDominant ? `0 0 10px ${dim.color}` : 'none',
              opacity: isDominant ? 1 : 0.5,
              transition: 'height 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease'
            }} />

            {/* Label */}
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '8px',
              color: isDominant ? 'var(--text-primary)' : 'var(--text-tertiary)',
              fontWeight: isDominant ? '600' : 'normal'
            }}>
              {dim.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default VectorDisplay;
