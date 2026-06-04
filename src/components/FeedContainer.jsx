import React, { useRef } from 'react';
import { useRecommendationStore } from '../store/useRecommendationStore';
import ReelCard from './ReelCard';

export const FeedContainer = () => {
  const feedQueue = useRecommendationStore((state) => state.feedQueue);
  const currentCardIndex = useRecommendationStore((state) => state.currentCardIndex);
  const setCurrentCardIndex = useRecommendationStore((state) => state.setCurrentCardIndex);
  const containerRef = useRef(null);

  const handleScroll = (e) => {
    const container = e.currentTarget;
    const scrollPos = container.scrollTop;
    const cardHeight = container.clientHeight;
    
    if (cardHeight > 0) {
      const index = Math.round(scrollPos / cardHeight);
      if (index !== currentCardIndex && index >= 0 && index < feedQueue.length) {
        setCurrentCardIndex(index);
      }
    }
  };

  return (
    <main 
      ref={containerRef}
      className="feed-container"
      onScroll={handleScroll}
    >
      {feedQueue.map((item) => (
        <ReelCard key={item.id} item={item} />
      ))}
    </main>
  );
};

export default FeedContainer;
