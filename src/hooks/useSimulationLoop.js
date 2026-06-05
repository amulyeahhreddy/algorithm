import { useEffect, useMemo, useRef } from 'react';
import { useVisualizationStore } from '../store/useVisualizationStore';
import { useRecommendationStore } from '../store/useRecommendationStore';
import { DynamicSystem } from '../engine/DynamicSystem';
import { FilterBubbleDetector } from '../engine/FilterBubbleDetector';
import { RecommendationEngine } from '../engine/RecommendationEngine';
import { CLUSTERS } from '../data/clusters';
import { contentItems } from '../data/contentItems';

export const useSimulationLoop = () => {
  const setUserPos = useVisualizationStore((state) => state.setUserPos);
  const setUserVelocity = useVisualizationStore((state) => state.setUserVelocity);
  const setTrajectory = useVisualizationStore((state) => state.setTrajectory);
  const setFilterBubble = useVisualizationStore((state) => state.setFilterBubble);
  const setForceField = useVisualizationStore((state) => state.setForceField);
  const setExplorationNoise = useVisualizationStore((state) => state.setExplorationNoise);
  const setRecommendationForce = useVisualizationStore((state) => state.setRecommendationForce);
  const setNoise = useVisualizationStore((state) => state.setNoise);
  const setGhostUser = useVisualizationStore((state) => state.setGhostUser);
  const setResetState = useVisualizationStore((state) => state.setResetState);
  const setPerturbationRing = useVisualizationStore((state) => state.setPerturbationRing);

  // Memoize solver and detector instances to persist across renders
  const dynamicSystem = useMemo(() => new DynamicSystem(), []);
  const filterBubbleDetector = useMemo(() => new FilterBubbleDetector(), []);
  const ghostSystemRef = useRef(null);
  const lastPerturbationActiveRef = useRef(false);

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

      const vizState = useVisualizationStore.getState();
      const recState = useRecommendationStore.getState();

      const speed = vizState.simulationSpeed || 1;
      let stepDt = dt * speed;
      // Cap scaled step delta time
      if (stepDt > 0.1 * speed) stepDt = 0.1 * speed;

      // 1. Reset Animation Easing or Normal ODE step
      if (vizState.resetState.active) {
        filterBubbleDetector.reset();
        
        let nextProgress = vizState.resetState.progress + dt / 2.0; // 2s transition in real-time
        if (nextProgress >= 1.0) {
          nextProgress = 1.0;
          setResetState({ active: false, startPos: null, progress: 0 });
          dynamicSystem.state.userPos = { x: 0.5, y: 0.5 };
          dynamicSystem.state.userVelocity = { x: 0, y: 0 };
          dynamicSystem.state.trajectory = [];
          dynamicSystem.state.recommendationForce = { x: 0, y: 0 };
        } else {
          setResetState({ progress: nextProgress });
          const t = nextProgress;
          // Cubic ease-in-out easing
          const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          const start = vizState.resetState.startPos || { x: 0.5, y: 0.5 };
          
          dynamicSystem.state.userPos.x = start.x + (0.5 - start.x) * ease;
          dynamicSystem.state.userPos.y = start.y + (0.5 - start.y) * ease;
          dynamicSystem.state.userVelocity = { x: 0, y: 0 };
          dynamicSystem.state.trajectory = [];
          dynamicSystem.state.recommendationForce = { x: 0, y: 0 };
        }
      } else {
        // Pull latest scores from Zustand
        const scores = recState.scores;

        // Perturbation noise override check
        const isPerturbed = vizState.perturbationActive;
        if (isPerturbed) {
          if (!lastPerturbationActiveRef.current) {
            // Apply substantial velocity kick to fling user out of current position
            dynamicSystem.state.userVelocity.x += (Math.random() - 0.5) * 0.16;
            dynamicSystem.state.userVelocity.y += (Math.random() - 0.5) * 0.16;
          }
          dynamicSystem.state.explorationNoise = 0.05;
        }
        lastPerturbationActiveRef.current = isPerturbed;

        // Run ODE step
        dynamicSystem.step(stepDt, contentItems, scores);


        // Update bubble detector metrics
        const userPos = dynamicSystem.state.userPos;
        filterBubbleDetector.update(userPos, CLUSTERS, stepDt);
        const bubbleInfo = filterBubbleDetector.analyze();
        
        // Exploration noise dampens/contracts as user polarizes into a filter bubble
        const bubbleStrength = bubbleInfo.strength || 0;
        const updatedNoise = 0.008 * (1 - Math.min(0.8, bubbleStrength * 0.8));
        
        let currentNoise = updatedNoise;
        if (isPerturbed) {
          currentNoise = 0.05;
        }
        dynamicSystem.state.explorationNoise = currentNoise;
        setExplorationNoise(currentNoise);

        // Dispatch bubble diagnostics
        setFilterBubble({
          active: bubbleInfo.active,
          center: bubbleInfo.clusterId ? CLUSTERS.find((c) => c.id === bubbleInfo.clusterId)?.pos : null,
          radius: bubbleInfo.radius,
          strength: bubbleInfo.strength,
          clusterId: bubbleInfo.clusterId
        });
      }

      // Fetch updated coordinates
      const { userPos, userVelocity, trajectory, recommendationForce } = dynamicSystem.state;

      // Dispatch calculations back to Zustand
      setUserPos({ ...userPos });
      setUserVelocity({ ...userVelocity });
      setTrajectory([...trajectory]);
      setRecommendationForce({ ...recommendationForce });
      setNoise({ ...dynamicSystem.state.noise });

      // 2. Perturbation Ring Update (Real-time expansion)
      if (vizState.perturbationRing) {
        const ring = vizState.perturbationRing;
        const newRadius = ring.radius + dt * 0.35; // expands at constant rate in seconds
        const newAlpha = Math.max(0, 1 - newRadius / 0.35); // fades out by max radius
        if (newAlpha <= 0) {
          setPerturbationRing(null);
        } else {
          setPerturbationRing({ ...ring, radius: newRadius, alpha: newAlpha });
        }
      }

      // 3. Ghost User Simulation Step (if active)
      if (vizState.ghostUser !== null) {
        if (ghostSystemRef.current === null) {
          ghostSystemRef.current = new DynamicSystem({
            userPos: { ...vizState.ghostUser.pos },
            userVelocity: { ...vizState.ghostUser.velocity },
            trajectory: [...vizState.ghostUser.trajectory],
            explorationNoise: 0.008
          });
        }

        const ghostVector = recState.userVector.map(v => 1.0 - v);
        const ghostScores = RecommendationEngine.computeScores(ghostVector, contentItems);

        // Step ghost system
        ghostSystemRef.current.step(stepDt, contentItems, ghostScores);

        // Update store
        setGhostUser({
          pos: { ...ghostSystemRef.current.state.userPos },
          velocity: { ...ghostSystemRef.current.state.userVelocity },
          trajectory: [...ghostSystemRef.current.state.trajectory],
          vector: ghostVector
        });
      } else {
        ghostSystemRef.current = null;
      }

      // 4. Expensive grid forcefield calculation every 30 frames
      frameCountRef.current += 1;
      if (frameCountRef.current % 30 === 0 && !vizState.resetState.active) {
        const scores = recState.scores;
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
    setExplorationNoise,
    setRecommendationForce,
    setNoise,
    setGhostUser,
    setResetState,
    setPerturbationRing
  ]);
};

export default useSimulationLoop;

