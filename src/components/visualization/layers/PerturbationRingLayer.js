/**
 * PerturbationRingLayer — renders an expanding white shockwave ring when 
 * the user triggers a system perturbation (escape event).
 */

export function renderPerturbationRingLayer(ctx, width, height, { perturbationRing }) {
  if (!perturbationRing) return;

  // Center coordinate
  const px = perturbationRing.x * width;
  const py = perturbationRing.y * height;
  const alpha = perturbationRing.alpha;

  if (alpha <= 0) return;

  // Scale normalized radius to screen space (using width as reference)
  const baseRadius = perturbationRing.radius * width;

  ctx.save();
  ctx.globalAlpha = alpha;

  // 1. Primary shockwave ring
  ctx.beginPath();
  ctx.arc(px, py, baseRadius, 0, Math.PI * 2);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.0;
  ctx.shadowColor = '#FFFFFF';
  ctx.shadowBlur = 12;
  ctx.stroke();

  // 2. Faint secondary trailing ring
  if (baseRadius > 15) {
    ctx.beginPath();
    ctx.arc(px, py, baseRadius - 12, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.0;
    ctx.shadowBlur = 0; // Clear shadow for performance
    ctx.stroke();
  }

  // 3. Expanding crosshair lines at origin
  const lineLen = 10 * (1 - alpha);
  ctx.beginPath();
  
  // Horizontal ticks
  ctx.moveTo(px - baseRadius - lineLen, py);
  ctx.lineTo(px - baseRadius + 4, py);
  ctx.moveTo(px + baseRadius - 4, py);
  ctx.lineTo(px + baseRadius + lineLen, py);
  
  // Vertical ticks
  ctx.moveTo(px, py - baseRadius - lineLen);
  ctx.lineTo(px, py - baseRadius + 4);
  ctx.moveTo(px, py + baseRadius - 4);
  ctx.lineTo(px, py + baseRadius + lineLen);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}
