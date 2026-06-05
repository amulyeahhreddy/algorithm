import { create } from 'zustand'

export const useVisualizationStore = create((set) => ({
  userPos: { x: 0.5, y: 0.5 },
  userVelocity: { x: 0, y: 0 },
  trajectory: [],
  explorationNoise: 0.008,
  filterBubble: { active: false, center: null, radius: 0.25, strength: 0, clusterId: null },
  clusterTimeInvested: { humor: 0, knowledge: 0, music: 0, sports: 0, lifestyle: 0 },
  showHeatmap: true,
  showVectors: true,
  showTrajectory: true,
  showBubble: true,
  // fieldMode controls which field visualisation is active (mutually exclusive)
  // 'off' | 'direction' | 'force' | 'streamlines'
  fieldMode: 'off',
  forceField: [],
  noise: { x: 0, y: 0 },

  // Phase 5 Enhanced Simulation State
  simulationSpeed: 1, // 1, 5, 20
  perturbationActive: false,
  perturbationRing: null, // { x, y, radius, alpha }
  ghostUser: null, // { pos: {x,y}, velocity: {x,y}, trajectory: [], vector: [] }
  resetState: { active: false, startPos: null, progress: 0 },
  recommendationForce: { x: 0, y: 0 },

  setForceField: (forceField) => set({ forceField }),
  setNoise: (noise) => set({ noise }),

  setUserPos: (userPos) => set({ userPos }),
  setUserVelocity: (userVelocity) => set({ userVelocity }),
  setTrajectory: (trajectory) => set({ trajectory }),
  addTrajectoryPoint: (point) => set((state) => ({ 
    trajectory: [...state.trajectory, point] 
  })),
  setExplorationNoise: (explorationNoise) => set({ explorationNoise }),
  setFilterBubble: (filterBubble) => set((state) => ({ 
    filterBubble: { ...state.filterBubble, ...filterBubble } 
  })),
  setClusterTimeInvested: (clusterTimeInvested) => set((state) => ({
    clusterTimeInvested: { ...state.clusterTimeInvested, ...clusterTimeInvested }
  })),
  setShowHeatmap: (showHeatmap) => set({ showHeatmap }),
  setShowVectors: (showVectors) => set({ showVectors }),
  setShowTrajectory: (showTrajectory) => set({ showTrajectory }),
  setShowBubble: (showBubble) => set({ showBubble }),
  setFieldMode: (fieldMode) => set({ fieldMode }),

  // Phase 5 Setters
  setSimulationSpeed: (simulationSpeed) => set({ simulationSpeed }),
  setPerturbationActive: (perturbationActive) => set({ perturbationActive }),
  setPerturbationRing: (perturbationRing) => set({ perturbationRing }),
  setGhostUser: (ghostUser) => set({ ghostUser }),
  setResetState: (resetState) => set((state) => ({ 
    resetState: { ...state.resetState, ...resetState } 
  })),
  setRecommendationForce: (recommendationForce) => set({ recommendationForce }),

  resetVisualizationStore: () => set({
    userVelocity: { x: 0, y: 0 },
    trajectory: [],
    explorationNoise: 0.008,
    filterBubble: { active: false, center: null, radius: 0.25, strength: 0, clusterId: null },
    clusterTimeInvested: { humor: 0, knowledge: 0, music: 0, sports: 0, lifestyle: 0 },
    perturbationActive: false,
    perturbationRing: null,
    ghostUser: null,
    resetState: { active: false, startPos: null, progress: 0 },
    recommendationForce: { x: 0, y: 0 },
    noise: { x: 0, y: 0 },
  })
}))

