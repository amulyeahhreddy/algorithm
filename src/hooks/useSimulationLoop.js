import { useEffect, useMemo, useRef } from 'react';
import { useVisualizationStore } from '../store/useVisualizationStore';
import { useRecommendationStore } from '../store/useRecommendationStore';
import { DynamicSystem } from '../engine/DynamicSystem';
import { FilterBubbleDetector } from '../engine/FilterBubbleDetector';
import { CLUSTERS } from '../data/clusters';
import { contentItems } from '../data/contentItems';

export const useSimulationLoop = () => {
  const setUserPos = useVisualizationStore((state) => state.setUserPos);
  const setUserVelocity = useVisualizationStore((state) => state.setUserVelocity);
  const setTrajectory = useVisualizationStore((state) => state.setTrajectory);
  const setFilterBubble = useVisualizationStore((state) => state.setFilterBubble);
  const setForceField = useVisualizationStore((state) => state.setForceField);
  const setExplorationNoise = useVisualizationStore((state) => state.setExplorationNoise);

  // Memoize solver and detector instances to persist across renders
  const dynamicSystem = useMemo(() => new DynamicSystem(), []);
  const filterBubbleDetector = useMemo(() => new FilterBubbleDetector(), []);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    const loop = (time) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(loop);
        return;
      }

      // Compute elapsed delta time in seconds
      let dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Cap delta time to prevent physics instability when tab runs in background
      if (dt > 0.1) dt = 0.1;
      if (dt <= 0) dt = 0.016; // default 60fps fallback

      // Pull latest scores from Zustand
      const scores = useRecommendationStore.getState().scores;

      // 1. Run ODE step
      dynamicSystem.step(dt, contentItems, scores);

      // 2. Fetch updated coordinates
      const { userPos, userVelocity, trajectory } = dynamicSystem.state;

      // 3. Dispatch calculations back to Zustand
      setUserPos({ ...userPos });
      setUserVelocity({ ...userVelocity });
      setTrajectory([...trajectory]);

      // 4. Update bubble detector metrics
      filterBubbleDetector.update(userPos, CLUSTERS, dt);
      const bubbleInfo = filterBubbleDetector.analyze();
      
      // Exploration noise dampens/contracts as user polarizes into a filter bubble
      const bubbleStrength = bubbleInfo.strength || 0;
      const updatedNoise = 0.008 * (1 - Math.min(0.8, bubbleStrength * 0.8));
      dynamicSystem.state.explorationNoise = updatedNoise;
      setExplorationNoise(updatedNoise);

      // Dispatch bubble diagnostics
      setFilterBubble({
        active: bubbleInfo.active,
        center: bubbleInfo.clusterId ? CLUSTERS.find((c) => c.id === bubbleInfo.clusterId)?.pos : null,
        radius: bubbleInfo.radius,
        strength: bubbleInfo.strength,
        clusterId: bubbleInfo.clusterId
      });

      // 5. Expensive grid forcefield calculation every 30 frames
      frameCountRef.current += 1;
      if (frameCountRef.current % 30 === 0) {
        const forceField = dynamicSystem.computeForceField(contentItems, scores);
        setForceField(forceField);
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [
    dynamicSystem,
    filterBubbleDetector,
    setUserPos,
    setUserVelocity,
    setTrajectory,
    setFilterBubble,
    setForceField,
    setExplorationNoise
  ]);
};

export default useSimulationLoop;
