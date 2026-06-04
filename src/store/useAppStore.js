import { create } from 'zustand'

export const useAppStore = create((set) => ({
  scene: 'feed', // 'feed' | 'reveal' | 'visualization'
  revealTriggered: false,
  revealComplete: false,
  presentationMode: false,
  activeInsight: null,

  setScene: (scene) => set({ scene }),
  triggerReveal: () => set({ revealTriggered: true }),
  setRevealComplete: (revealComplete) => set({ revealComplete }),
  setPresentationMode: (presentationMode) => set({ presentationMode }),
  setInsight: (text) => set({ activeInsight: text }),
}))
