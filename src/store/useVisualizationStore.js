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
  showForceField: false,
  showTrajectory: true,
  showBubble: true,
  forceField: [],

  setForceField: (forceField) => set({ forceField }),

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
  setShowForceField: (showForceField) => set({ showForceField }),
  setShowTrajectory: (showTrajectory) => set({ showTrajectory }),
  setShowBubble: (showBubble) => set({ showBubble }),
}))
