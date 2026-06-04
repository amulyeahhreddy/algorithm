import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { useRecommendationStore } from '../store/useRecommendationStore';

export const RevealButton = () => {
  const triggerReveal = useAppStore((state) => state.triggerReveal);
  const setScene = useAppStore((state) => state.setScene);
  const interactions = useRecommendationStore((state) => state.interactions);

  const interactionCount = interactions.length;
  const isSupercharged = interactionCount >= 5;

  const handleClick = () => {
    triggerReveal();
    setScene('reveal');
  };

  return (
    <div className="reveal-button-container">
      <button
        type="button"
        onClick={handleClick}
        className={`reveal-button ${isSupercharged ? 'supercharged' : ''}`}
      >
        Reveal The Algorithm
      </button>
      <span className="reveal-badge">
        {interactionCount} interaction{interactionCount !== 1 ? 's' : ''} logged
      </span>
    </div>
  );
};

export default RevealButton;
