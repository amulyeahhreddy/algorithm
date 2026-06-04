import { project6Dto2D } from './VectorMath';

const clamp01 = (val) => Math.max(0, Math.min(1, val));

export class DynamicSystem {
  constructor(initialState = {}) {
    this.state = {
      userPos: { x: 0.5, y: 0.5 },
      userVelocity: { x: 0, y: 0 },
      trajectory: [], // array of { x, y, t }
      explorationNoise: 0.008,
      simulationTime: 0,
      forceField: [],
      ...initialState
    };
  }

  computeRecommendationForce(userPos, contentItems, scores) {
    // Pull toward high-similarity content
    // F = Σᵢ wᵢ × (cᵢ - userPos)
    // where wᵢ = score[i] × engagementWeight
    // Sum over TOP 8 highest-scored items only
    // cap total force magnitude at 0.05 to prevent explosions
    let fx = 0;
    let fy = 0;
    
    // Sort items by score descending and take the top 8
    const topItems = [...contentItems]
      .sort((a, b) => {
        const scoreA = scores instanceof Map ? (scores.get(a.id) || 0) : (scores[a.id] || 0);
        const scoreB = scores instanceof Map ? (scores.get(b.id) || 0) : (scores[b.id] || 0);
        return scoreB - scoreA;
      })
      .slice(0, 8);

    topItems.forEach((item) => {
      const itemPos = project6Dto2D(item.vector);
      const w = scores instanceof Map ? (scores.get(item.id) || 0) : (scores[item.id] || 0);
      fx += w * (itemPos.x - userPos.x);
      fy += w * (itemPos.y - userPos.y);
    });

    const mag = Math.sqrt(fx * fx + fy * fy);
    const cap = 0.05;
    if (mag > cap) {
      fx = (fx / mag) * cap;
      fy = (fy / mag) * cap;
    }
    return { x: fx, y: fy };
  }

  step(dt, contentItems, scores) {
    // Euler integration — call this every animation frame
    const force = this.computeRecommendationForce(this.state.userPos, contentItems, scores);
    
    const noise = {
      x: (Math.random() - 0.5) * this.state.explorationNoise,
      y: (Math.random() - 0.5) * this.state.explorationNoise
    };

    // Update velocity with force + damping
    this.state.userVelocity.x = (this.state.userVelocity.x + force.x * dt) * 0.88;
    this.state.userVelocity.y = (this.state.userVelocity.y + force.y * dt) * 0.88;

    // Update position
    this.state.userPos.x = clamp01(this.state.userPos.x + this.state.userVelocity.x + noise.x);
    this.state.userPos.y = clamp01(this.state.userPos.y + this.state.userVelocity.y + noise.y);

    // Record trajectory
    this.state.trajectory.push({ 
      x: this.state.userPos.x, 
      y: this.state.userPos.y, 
      t: this.state.simulationTime 
    });

    if (this.state.trajectory.length > 300) {
      this.state.trajectory.shift();
    }

    this.state.simulationTime += dt;
  }

  computeForceField(contentItems, scores) {
    // Compute force vectors on a 20×20 grid for visualization
    // This is expensive — only run every 30 frames
    const grid = [];
    for (let i = 0; i < 20; i++) {
      grid[i] = [];
      for (let j = 0; j < 20; j++) {
        const pos = { x: (i + 0.5) / 20, y: (j + 0.5) / 20 };
        grid[i][j] = this.computeRecommendationForce(pos, contentItems, scores);
      }
    }
    return grid;
  }
}

export default DynamicSystem;
