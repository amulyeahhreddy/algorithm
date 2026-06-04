import { cosineSimilarity, normalize } from './VectorMath';

export class RecommendationEngine {
  static computeScores(userVector, contentItems) {
    const scores = new Map();
    contentItems.forEach((item) => {
      const score = cosineSimilarity(userVector, item.vector);
      scores.set(item.id, score);
    });
    return scores;
  }

  static updateUserVector(currentVector, interaction) {
    const RATES = { 
      liked: 0.15, 
      rewatched: 0.20, 
      watched: 0.08, 
      skipped: -0.04 
    };
    
    const alpha = RATES[interaction.type] || 0;
    
    let newVector = currentVector.map(
      (v, i) => v + alpha * interaction.item.vector[i]
    );
    
    newVector = normalize(newVector);
    
    // Ensure all values stay in [0.05, 0.95] range
    return newVector.map((v) => Math.max(0.05, Math.min(0.95, v)));
  }

  static rankFeed(scores, contentItems) {
    return [...contentItems].sort((a, b) => {
      const scoreA = (scores.get(a.id) || 0) + Math.random() * 0.05;
      const scoreB = (scores.get(b.id) || 0) + Math.random() * 0.05;
      return scoreB - scoreA;
    });
  }
}

export default RecommendationEngine;
