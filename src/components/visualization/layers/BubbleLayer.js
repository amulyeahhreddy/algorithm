/**
 * BubbleLayer — renders the filter bubble boundary with animated distortion
 * When active, draws an organic pulsing boundary around the user's trapped zone.
 */

export function renderBubbleLayer(ctx, width, height, { filterBubble, clusters, time }) {
  if (!filterBubble || !filterBubble.active) return;

  const center = filterBubble.center;
  if (!center) return;

  const cx = center.x * width;
  const cy = center.y * height;
  const radius = filterBubble.radius * Math.min(width, height);
  const strength = filterBubble.strength || 0;

  ctx.save();

  // Get cluster color for the bubble
  const cluster = (clusters || []).find((c) => c.id === filterBubble.clusterId);
  const bubbleColor = cluster ? cluster.color : '#FF4757';

  // Outer distortion ring — organic wobble
  const points = 64;
  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;

    // Perlin-like noise via stacked sinusoids for organic boundary
    const wobble1 = Math.sin(angle * 3 + time * 1.5) * 8 * strength;
    const wobble2 = Math.sin(angle * 7 - time * 2.3) * 4 * strength;
    const wobble3 = Math.cos(angle * 5 + time * 0.8) * 3 * strength;
    const r = radius + wobble1 + wobble2 + wobble3;

    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;

    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();

  // Fill with subtle gradient
  const fillGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.2);
  fillGrad.addColorStop(0, bubbleColor + '08');
  fillGrad.addColorStop(0.6, bubbleColor + '12');
  fillGrad.addColorStop(0.85, bubbleColor + '18');
  fillGrad.addColorStop(1, bubbleColor + '00');
  ctx.fillStyle = fillGrad;
  ctx.fill();

  // Stroke the distorted boundary
  ctx.strokeStyle = bubbleColor + '55';
  ctx.lineWidth = 1.5 + strength * 2;
  ctx.setLineDash([6, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Inner warning ring when strongly bubbled
  if (strength > 0.3) {
    const innerRadius = radius * 0.6;
    const innerPulse = 0.8 + 0.2 * Math.sin(time * 3);

    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius * innerPulse, 0, Math.PI * 2);
    ctx.strokeStyle = bubbleColor + '30';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // "FILTER BUBBLE DETECTED" label when active
  if (strength > 0.15) {
    const labelY = cy - radius - 20;
    const labelAlpha = Math.min(1, strength * 2);
    const blink = Math.sin(time * 4) > 0 ? 1 : 0.5;

    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = bubbleColor + Math.floor(labelAlpha * blink * 255).toString(16).padStart(2, '0');
    ctx.fillText('⚠ FILTER BUBBLE DETECTED', cx, labelY);

    ctx.font = '8px "IBM Plex Mono", monospace';
    ctx.fillStyle = bubbleColor + '80';
    ctx.fillText(`strength: ${(strength * 100).toFixed(0)}%`, cx, labelY + 14);
  }

  ctx.restore();
}
