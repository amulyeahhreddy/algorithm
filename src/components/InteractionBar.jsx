import React, { useState } from 'react';
import { useRecommendationStore } from '../store/useRecommendationStore';
import { RecommendationEngine } from '../engine/RecommendationEngine';

export const InteractionBar = ({ item }) => {
  const addInteraction = useRecommendationStore((state) => state.addInteraction);
  const userVector = useRecommendationStore((state) => state.userVector);
  const setUserVector = useRecommendationStore((state) => state.setUserVector);

  const [isLiked, setIsLiked] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isRepeated, setIsRepeated] = useState(false);

  const handleLike = () => {
    if (isLiked) return; // Only like once
    setIsLiked(true);
    
    const interaction = {
      type: 'liked',
      item,
      duration: 0,
      timestamp: Date.now()
    };
    
    addInteraction(interaction);
    const updated = RecommendationEngine.updateUserVector(userVector, interaction);
    setUserVector(updated);
  };

  const handleShare = () => {
    setIsShared(true);
    setTimeout(() => setIsShared(false), 500);

    const interaction = {
      type: 'watched',
      item,
      action: 'shared',
      duration: 0,
      timestamp: Date.now()
    };
    addInteraction(interaction);
  };

  const handleRepeat = () => {
    setIsRepeated(true);
    setTimeout(() => setIsRepeated(false), 800);

    const interaction = {
      type: 'rewatched',
      item,
      duration: 0,
      timestamp: Date.now()
    };
    
    addInteraction(interaction);
    const updated = RecommendationEngine.updateUserVector(userVector, interaction);
    setUserVector(updated);
  };

  const likeDisplayCount = isLiked ? 'Liked' : item.likes;
  const shareDisplayCount = item.shares;
  const commentDisplayCount = item.comments;

  return (
    <div className="interaction-bar">
      {/* LIKE */}
      <div className="interaction-button-group">
        <button 
          type="button" 
          onClick={handleLike}
          className={`interaction-button ${isLiked ? 'active' : ''}`}
          aria-label="Like"
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
        <span className="interaction-count">{likeDisplayCount}</span>
      </div>

      {/* COMMENT */}
      <div className="interaction-button-group">
        <button 
          type="button" 
          className="interaction-button"
          aria-label="Comments"
        >
          <svg viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
          </svg>
        </button>
        <span className="interaction-count">{commentDisplayCount}</span>
      </div>

      {/* SHARE */}
      <div className="interaction-button-group">
        <button 
          type="button" 
          onClick={handleShare}
          className={`interaction-button ${isShared ? 'active' : ''}`}
          aria-label="Share"
        >
          <svg viewBox="0 0 24 24">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.8 2.04.8 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.8l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
          </svg>
        </button>
        <span className="interaction-count">{isShared ? 'Shared' : shareDisplayCount}</span>
      </div>

      {/* REPLAY / REWATCH */}
      <div className="interaction-button-group">
        <button 
          type="button" 
          onClick={handleRepeat}
          className={`interaction-button ${isRepeated ? 'active' : ''}`}
          aria-label="Repeat"
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6 0 3.31-2.69 6-6 6s-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
          </svg>
        </button>
        <span className="interaction-count">{isRepeated ? 'Looping' : 'Repeat'}</span>
      </div>
    </div>
  );
};

export default InteractionBar;
