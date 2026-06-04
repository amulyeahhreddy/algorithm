import { project6Dto2D } from './VectorMath';

export class ClusteringEngine {
  static getSoftMembership(pos, clusters) {
    // Returns { clusterId: weight } for all clusters
    // Weight = exp(-dist² / (2 × σ²)), σ = 0.25
    const memberships = {};
    clusters.forEach((c) => {
      const dx = pos.x - c.pos.x;
      const dy = pos.y - c.pos.y;
      const distSq = dx * dx + dy * dy;
      memberships[c.id] = Math.exp(-distSq / (2 * 0.25 * 0.25));
    });

    // Normalize so they sum to 1
    const total = Object.values(memberships).reduce((a, b) => a + b, 0);
    if (total > 0) {
      Object.keys(memberships).forEach((k) => {
        memberships[k] /= total;
      });
    }
    return memberships;
  }

  static getDominantCluster(pos, clusters) {
    const memberships = this.getSoftMembership(pos, clusters);
    const sorted = Object.entries(memberships).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : null;
  }

  static assignContentToClusters(contentItems, clusters) {
    // Pre-compute 2D position and dominant cluster for each content item
    return contentItems.map((item) => {
      const pos2d = project6Dto2D(item.vector);
      return {
        ...item,
        pos2d,
        dominantCluster: this.getDominantCluster(pos2d, clusters),
        clusterWeights: this.getSoftMembership(pos2d, clusters),
      };
    });
  }
}

export default ClusteringEngine;
