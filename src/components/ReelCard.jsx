import React, { useRef } from 'react';
import useInteractionTracker from '../hooks/useInteractionTracker';
import InteractionBar from './InteractionBar';

export const ReelCard = ({ item }) => {
  const cardRef = useRef(null);
  
  // Track scroll observation and engagement times
  useInteractionTracker(cardRef, item);

  return (
    <article 
      ref={cardRef} 
      className={`reel-card category-${item.category}`}
    >
      {/* Central Floating Visual */}
      <div className="reel-center">
        <div className="reel-icon-wrapper">
          {item.icon}
        </div>
      </div>

      {/* Creator Info & Captions */}
      <div className="reel-details">
        <span className="reel-creator">
          {item.creator}
        </span>
        <h3 className="reel-title">
          {item.title}
        </h3>
      </div>

      {/* Engagement Actions Column */}
      <InteractionBar item={item} />
    </article>
  );
};

export default ReelCard;
