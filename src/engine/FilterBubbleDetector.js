import { ClusteringEngine } from './ClusteringEngine';

export class FilterBubbleDetector {
  constructor() {
    this.clusterDwellTime = {
      humor: 0,
      knowledge: 0,
      music: 0,
      sports: 0,
      lifestyle: 0
    };
    this.totalTime = 0;
  }

  update(userPos, clusters, dt) {
    const dominant = ClusteringEngine.getDominantCluster(userPos, clusters);
    if (dominant) {
      this.clusterDwellTime[dominant] = (this.clusterDwellTime[dominant] || 0) + dt;
    }
    this.totalTime += dt;
  }

  analyze() {
    const entries = Object.entries(this.clusterDwellTime).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0 || this.totalTime === 0) {
      return { 
        active: false, 
        clusterId: null, 
        fraction: 0, 
        radius: 0.25, 
        strength: 0 
      };
    }

    const [topClusterId, topTime] = entries[0];
    const fraction = topTime / this.totalTime;

    // Bubble active conditions:
    // Fraction of time spent in dominant category > 62% and total time is > 15 seconds
    const active = fraction > 0.62 && this.totalTime > 15;
    
    // Bubble strength: 0 to 1 range (scaled based on fraction remaining space above 0.62)
    const strength = Math.max(0, fraction - 0.62) / 0.38; 
    
    // Bubble radius: shrinks as bubble forms
    const radius = 0.28 - Math.max(0, fraction - 0.62) * 0.35;

    return {
      active,
      clusterId: topClusterId,
      fraction,
      radius,
      strength
    };
  }
}

export default FilterBubbleDetector;
