/**
 * AlgorithmCanvas — Main orchestrator for the multi-layered canvas visualization.
 * Reads from Zustand stores and paints each layer in order every frame.
 */
import React, { useRef, useEffect, useCallback } from 'react';
import { useVisualizationStore } from '../../store/useVisualizationStore';
import { useRecommendationStore } from '../../store/useRecommendationStore';
import { CLUSTERS } from '../../data/clusters';
import { contentItems } from '../../data/contentItems';
import { ClusteringEngine } from '../../engine/ClusteringEngine';

import { renderHeatmapLayer } from './layers/HeatmapLayer';
import { renderClusterLayer } from './layers/ClusterLayer';
import { renderVectorLayer } from './layers/VectorLayer';
import { renderForceFieldLayer } from './layers/ForceFieldLayer';
import { renderPhaseAxes } from './layers/PhaseAxesLayer';
import { renderBubbleLayer } from './layers/BubbleLayer';
import { renderTrajectoryLayer } from './layers/TrajectoryLayer';
import { renderUserLayer } from './layers/UserLayer';
import { renderStreamlines } from './layers/StreamlineLayer';
import { renderDirectionField } from './layers/DirectionFieldLayer';

// Phase 5 Enhanced Layers
import { renderAttractorBasinLayer } from './layers/AttractorBasinLayer';
import { renderGradientDescentLayer } from './layers/GradientDescentLayer';
import { renderGhostUserLayer } from './layers/GhostUserLayer';
import { renderPerturbationRingLayer } from './layers/PerturbationRingLayer';

// Pre-compute content 2D positions once
const contentWithPositions = ClusteringEngine.assignContentToClusters(contentItems, CLUSTERS);

const AlgorithmCanvas = () => {
  const canvasRef = useRef(null);
  const timeRef = useRef(0);
  const rafRef = useRef(null);
  const maxMagnitudeRef = useRef(0.001);
  const lastForceFieldRef = useRef(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    // Use logical (CSS) dimensions for drawing since ctx is already scaled by DPR
    const width = parseFloat(canvas.dataset.logicalWidth) || canvas.width;
    const height = parseFloat(canvas.dataset.logicalHeight) || canvas.height;

    // Read latest state from Zustand (non-reactive — we read on each frame)
    const vizState = useVisualizationStore.getState();
    const recState = useRecommendationStore.getState();

    const time = timeRef.current;

    // Clear canvas (use full logical area; ctx is pre-scaled)
    ctx.clearRect(0, 0, width, height);

    // Layer 0: Phase Plane Coordinate Grid (always rendered on bottom)
    renderPhaseAxes(ctx, width, height);

    // Layer 1: Heatmap (bottom layer)
    if (vizState.showHeatmap) {
      renderHeatmapLayer(ctx, width, height, {
        userVector: recState.userVector,
        contentItems: contentWithPositions
      });
    }

    // Layers 2–2.5: Mutually exclusive field visualisation modes
    if (vizState.fieldMode === 'force') {
      // Force Field — arrows scaled by magnitude
      if (vizState.forceField && vizState.forceField !== lastForceFieldRef.current) {
        lastForceFieldRef.current = vizState.forceField;
        const allMagnitudes = vizState.forceField.flat().map(f => Math.sqrt(f.x * f.x + f.y * f.y));
        maxMagnitudeRef.current = Math.max(...allMagnitudes, 0.001);
      }
      renderForceFieldLayer(ctx, width, height, {
        forceField: vizState.forceField,
        maxMagnitude: maxMagnitudeRef.current,
        time
      });
    } else if (vizState.fieldMode === 'streamlines') {
      // Streamlines — integral curves of the field
      renderStreamlines(ctx, width, height, vizState.forceField);
    } else if (vizState.fieldMode === 'direction') {
      // Direction Field — classic ODE slope field (equal-length ticks)
      renderDirectionField(ctx, width, height, vizState.forceField);
    }

    // Layer 3: Clusters
    renderClusterLayer(ctx, width, height, {
      clusters: CLUSTERS,
      userPos: vizState.userPos,
      time
    });

    // Layer 4: Attractor Basin (Phase 5)
    renderAttractorBasinLayer(ctx, width, height, {
      clusters: CLUSTERS,
      filterBubble: vizState.filterBubble,
      time
    });

    // Layer 5: Content vectors (dots)
    if (vizState.showVectors) {
      renderVectorLayer(ctx, width, height, {
        contentItems: contentWithPositions,
        clusters: CLUSTERS,
        userVector: recState.userVector,
        time
      });
    }

    // Layer 6: Trajectory trail
    if (vizState.showTrajectory) {
      renderTrajectoryLayer(ctx, width, height, {
        trajectory: vizState.trajectory,
        time
      });
    }

    // Layer 7: Ghost User twin (Phase 5)
    renderGhostUserLayer(ctx, width, height, {
      ghostUser: vizState.ghostUser,
      time
    });

    // Layer 8: Filter bubble boundary
    if (vizState.showBubble) {
      renderBubbleLayer(ctx, width, height, {
        filterBubble: vizState.filterBubble,
        clusters: CLUSTERS,
        time
      });
    }

    // Layer 9: User position
    renderUserLayer(ctx, width, height, {
      userPos: vizState.userPos,
      userVelocity: vizState.userVelocity,
      recommendationForce: vizState.recommendationForce,
      noise: vizState.noise,
      time
    });

    // Layer 10: Gradient Descent Optimization Arrow (Phase 5)
    renderGradientDescentLayer(ctx, width, height, {
      userPos: vizState.userPos,
      recommendationForce: vizState.recommendationForce,
      time
    });

    // Layer 11: Perturbation Expanding Shockwave (Phase 5)
    renderPerturbationRingLayer(ctx, width, height, {
      perturbationRing: vizState.perturbationRing
    });

    timeRef.current += 0.016; // ~60fps time step
    rafRef.current = requestAnimationFrame(render);
  }, []);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      // Store logical size as data attributes for the render loop
      canvas.dataset.logicalWidth = rect.width;
      canvas.dataset.logicalHeight = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Kick off render loop
    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      className="algorithm-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
      }}
    />
  );
};

export default AlgorithmCanvas;
