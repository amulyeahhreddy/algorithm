import { useEffect, useRef } from 'react';
import { useRecommendationStore } from '../store/useRecommendationStore';
import { RecommendationEngine } from '../engine/RecommendationEngine';

export const useInteractionTracker = (cardRef, item) => {
  const addInteraction = useRecommendationStore((state) => state.addInteraction);
  
  const entryTimeRef = useRef(null);
  const visibilityCountRef = useRef(0);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Card entered the viewport
          entryTimeRef.current = performance.now();
          visibilityCountRef.current += 1;
        } else {
          // Card exited the viewport
          if (entryTimeRef.current !== null) {
            const exitTime = performance.now();
            const durationMs = exitTime - entryTimeRef.current;
            const durationSec = durationMs / 1000;

            // Determine interaction type based on duration
            // < 1.5s: 'skipped'
            // 1.5–5s: 'glanced'
            // 5–15s: 'watched'
            // > 15s OR scroll back: 'rewatched'
            let type = 'skipped';
            if (durationSec >= 1.5 && durationSec < 5) {
              type = 'glanced';
            } else if (durationSec >= 5 && durationSec <= 15) {
              type = 'watched';
            } else if (durationSec > 15) {
              type = 'rewatched';
            }

            // Scroll back means visibility count > 1
            if (visibilityCountRef.current > 1) {
              type = 'rewatched';
            }

            const interaction = {
              type,
              item,
              duration: durationSec,
              timestamp: Date.now(),
              visibilityCount: visibilityCountRef.current
            };

            // Call store action to add log
            addInteraction(interaction);

            // Fetch absolute latest user vector directly to prevent stale closure issues
            const currentVector = useRecommendationStore.getState().userVector;
            const updatedVector = RecommendationEngine.updateUserVector(currentVector, interaction);
            useRecommendationStore.getState().setUserVector(updatedVector);

            entryTimeRef.current = null;
          }
        }
      },
      {
        threshold: 0.5 // Triggers when 50% of the card crosses viewport boundaries
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [cardRef, item, addInteraction]);
};

export default useInteractionTracker;
