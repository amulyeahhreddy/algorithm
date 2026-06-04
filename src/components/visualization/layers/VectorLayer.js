/**
 * VectorLayer — renders content items as dots scaled by similarity score
 * Color is inherited from cluster. Size encodes engagement/similarity.
 */
import { cosineSimilarity } from '../../../engine/VectorMath';

export function renderVectorLayer(ctx, width, height, { contentItems, clusters, userVector, time }) {
  if (!contentItems || contentItems.length === 0) return;

  ctx.save();

  // Build cluster color lookup
  const clusterColors = {};
  (clusters || []).forEach((c) => {
    clusterColors[c.id] = c.color;
  });

  contentItems.forEach((item, i) => {
    if (!item.pos2d) return;

    const x = item.pos2d.x * width;
    const y = item.pos2d.y * height;

    // Compute similarity to user
    const sim = userVector ? cosineSimilarity(userVector, item.vector) : 0.3;
    const color = clusterColors[item.category] || '#00E5FF';

    // Size: base 3px, scales up to 10px with similarity
    const baseSize = 3;
    const size = baseSize + sim * 7;

    // Floating micro-animation per dot
    const floatOffset = Math.sin(time * 1.5 + i * 0.7) * 2;

    // Glow for high-similarity items
    if (sim > 0.6) {
      const glowRadius = size * 3;
      const glow = ctx.createRadialGradient(x, y + floatOffset, 0, x, y + floatOffset, glowRadius);
      glow.addColorStop(0, color + '30');
      glow.addColorStop(1, color + '00');
      ctx.beginPath();
      ctx.arc(x, y + floatOffset, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
    }

    // The dot itself
    const dotGrad = ctx.createRadialGradient(x, y + floatOffset, 0, x, y + floatOffset, size);
    dotGrad.addColorStop(0, color);
    dotGrad.addColorStop(0.7, color + 'BB');
    dotGrad.addColorStop(1, color + '00');

    ctx.beginPath();
    ctx.arc(x, y + floatOffset, size, 0, Math.PI * 2);
    ctx.fillStyle = dotGrad;
    ctx.fill();

    // Center bright point
    ctx.beginPath();
    ctx.arc(x, y + floatOffset, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF' + (sim > 0.5 ? 'DD' : '66');
    ctx.fill();
  });

  ctx.restore();
}
