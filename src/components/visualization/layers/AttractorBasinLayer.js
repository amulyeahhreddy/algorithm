/**
 * AttractorBasinLayer — renders rotating concentric dashed rings at the dominant cluster.
 * Displays inward-pointing gravity chevrons when the filter bubble is forming (strength > 0.3).
 */

export function renderAttractorBasinLayer(ctx, width, height, { clusters, filterBubble, time }) {
  if (!filterBubble || !filterBubble.clusterId || filterBubble.strength <= 0.3) return;

  const cluster = clusters.find((c) => c.id === filterBubble.clusterId);
  if (!cluster) return;

  const cx = cluster.pos.x * width;
  const cy = cluster.pos.y * height;
  const strength = filterBubble.strength;

  ctx.save();
  ctx.globalAlpha = 0.2 + strength * 0.4; // Fades in as strength grows
  ctx.strokeStyle = cluster.color;
  ctx.fillStyle = cluster.color;
  ctx.lineWidth = 1.2;

  // 1. Concentric rotating dashed rings
  const ringRadii = [40, 75, 110];
  const directions = [1, -0.6, 0.4]; // Alternating rotation directions and speeds

  ringRadii.forEach((radius, idx) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    
    // Setup dashed ring rotation
    ctx.setLineDash([4, 6, 8, 6]);
    ctx.lineDashOffset = time * 40 * directions[idx];
    ctx.stroke();
    ctx.restore();

    // 2. Inward chevrons on outer rings (idx > 0)
    if (idx > 0) {
      const chevronCount = idx === 1 ? 8 : 12;
      const angleStep = (Math.PI * 2) / chevronCount;
      const rotationOffset = time * 0.15 * directions[idx];

      for (let i = 0; i < chevronCount; i++) {
        const theta = i * angleStep + rotationOffset;
        const tx = cx + radius * Math.cos(theta);
        const ty = cy + radius * Math.sin(theta);

        // Chevron legs pointing radially inward
        const legLen = 6;
        const spread = 0.35; // Angle spread of the chevron legs

        ctx.beginPath();
        ctx.moveTo(
          tx - legLen * Math.cos(theta - spread),
          ty - legLen * Math.sin(theta - spread)
        );
        ctx.lineTo(tx, ty);
        ctx.lineTo(
          tx - legLen * Math.cos(theta + spread),
          ty - legLen * Math.sin(theta + spread)
        );
        ctx.stroke();
      }
    }
  });

  // 3. Central pulsing field ring
  const pulseRadius = 15 + 3 * Math.sin(time * 4);
  ctx.beginPath();
  ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
  ctx.setLineDash([2, 4]);
  ctx.stroke();

  // 4. Attractor Text Label
  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '0.15em';
  ctx.fillText('SYSTEM ATTRACTOR BASIN', cx, cy - 110 - 8);

  ctx.restore();
}
