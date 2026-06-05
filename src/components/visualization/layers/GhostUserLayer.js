/**
 * GhostUserLayer — renders a preference-inverted "twin" user showing path divergence.
 * Drawn as a dim violet indicator with a dashed trajectory trail.
 */

export function renderGhostUserLayer(ctx, width, height, { ghostUser, time }) {
  if (!ghostUser || !ghostUser.pos) return;

  const gx = ghostUser.pos.x * width;
  const gy = ghostUser.pos.y * height;
  const violetColor = '#7C3AED';

  ctx.save();

  // 1. Draw dashed trajectory trail
  const trajectory = ghostUser.trajectory || [];
  if (trajectory.length > 1) {
    ctx.beginPath();
    ctx.moveTo(trajectory[0].x * width, trajectory[0].y * height);
    
    for (let i = 1; i < trajectory.length; i++) {
      ctx.lineTo(trajectory[i].x * width, trajectory[i].y * height);
    }

    ctx.strokeStyle = 'rgba(124, 90, 237, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([2, 4]);
    ctx.stroke();
  }

  // 2. Draw ghost user indicator
  // Pulse animation for the twin
  const pulse = 0.8 + 0.2 * Math.sin(time * 2.5);
  const radius = 6 * pulse;

  // Outer glow
  const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, radius + 6);
  grad.addColorStop(0, 'rgba(124, 58, 237, 0.4)');
  grad.addColorStop(0.6, 'rgba(124, 58, 237, 0.15)');
  grad.addColorStop(1, 'rgba(124, 58, 237, 0)');
  ctx.beginPath();
  ctx.arc(gx, gy, radius + 6, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Inner ring
  ctx.beginPath();
  ctx.arc(gx, gy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(124, 58, 237, ${0.4 + pulse * 0.2})`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Center core dot
  ctx.beginPath();
  ctx.arc(gx, gy, 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fill();

  // 3. Labels
  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(124, 58, 237, 0.7)';
  ctx.fillText('û_twin (inverted)', gx, gy - radius - 6);

  ctx.restore();
}
