import { create } from 'zustand'

export const useRecommendationStore = create((set) => ({
  userVector: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  interactions: [],
  feedQueue: [],
  currentCardIndex: 0,
  scores: {},

  setUserVector: (userVector) => set({ userVector }),
  addInteraction: (interaction) => set((state) => ({ 
    interactions: [...state.interactions, interaction] 
  })),
  setFeedQueue: (feedQueue) => set({ feedQueue }),
  setScores: (scores) => set({ scores }),
  setCurrentCardIndex: (currentCardIndex) => set({ currentCardIndex }),
}))
