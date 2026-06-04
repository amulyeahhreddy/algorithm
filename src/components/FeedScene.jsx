import React, { useEffect, useState } from 'react';
import { useRecommendationStore } from '../store/useRecommendationStore';
import { contentItems } from '../data/contentItems';
import { RecommendationEngine } from '../engine/RecommendationEngine';
import useSimulationLoop from '../hooks/useSimulationLoop';
import FeedHeader from './FeedHeader';
import FeedContainer from './FeedContainer';
import RevealButton from './RevealButton';
import AlgorithmHUD from './AlgorithmHUD';
import PhaseIndicator from './PhaseIndicator';

export const FeedScene = () => {
  const setFeedQueue = useRecommendationStore((state) => state.setFeedQueue);
  const feedQueue = useRecommendationStore((state) => state.feedQueue);
  const userVector = useRecommendationStore((state) => state.userVector);
  const currentCardIndex = useRecommendationStore((state) => state.currentCardIndex);
  const interactions = useRecommendationStore((state) => state.interactions);
  const setScores = useRecommendationStore((state) => state.setScores);

  const [showToast, setShowToast] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);

  // Initialize background recommendation simulation loop
  useSimulationLoop();

  // Initialize: Shuffle content items on mount to start feed randomly
  useEffect(() => {
    const shuffled = [...contentItems].sort(() => Math.random() - 0.5);
    setFeedQueue(shuffled);
  }, [setFeedQueue]);

  // Recalculate recommendation rankings and order unvisited slots whenever user vector evolves
  useEffect(() => {
    // Compute similarity scores using cosine similarity math
    const scores = RecommendationEngine.computeScores(userVector, contentItems);
    setScores(scores);

    if (feedQueue.length === 0) return;

    // Keep past history and currently viewing card frozen in place
    const visitedAndCurrent = feedQueue.slice(0, currentCardIndex + 1);
    const visitedIds = new Set(visitedAndCurrent.map((item) => item.id));

    // Get unvisited feed contents
    const remainingItems = contentItems.filter((item) => !visitedIds.has(item.id));

    // Rank and sort remaining items based on scores
    const rankedRemaining = RecommendationEngine.rankFeed(scores, remainingItems);

    // Reconstruct feed with frozen past + newly prioritized future items
    const updatedQueue = [...visitedAndCurrent, ...rankedRemaining];
    setFeedQueue(updatedQueue);
  }, [userVector]);

  // Handle toast alert when reaching 10 interactions
  useEffect(() => {
    if (interactions.length >= 10 && !hasShownToast) {
      setShowToast(true);
      setHasShownToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [interactions.length, hasShownToast]);

  return (
    <div className="feed-viewport">
      {/* Centered Mobile Shell */}
      <div className="feed-mobile-container">
        <FeedHeader />
        <FeedContainer />
        <PhaseIndicator />
      </div>

      {/* Peripheral HUD and CTAs */}
      <AlgorithmHUD />
      <RevealButton />

      {/* Subtle toast */}
      {showToast && (
        <div className="pattern-toast">
          ⬡ SYSTEM NOTICE: PATTERN DETECTED. ADJUSTING REALITY STREAM.
        </div>
      )}
    </div>
  );
};

export default FeedScene;
