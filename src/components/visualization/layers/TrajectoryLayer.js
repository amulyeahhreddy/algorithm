/**
 * TrajectoryLayer — renders the user's movement history as a gradient trail
 * Older points are dimmer, newer points are brighter.
 * The trail subtly pulses with a breathing effect.
 */

export function renderTrajectoryLayer(ctx, width, height, { trajectory, time }) {
  if (!trajectory || trajectory.length < 2) return;

  ctx.save();

  const len = trajectory.length;

  // Draw trail segments with increasing brightness
  for (let i = 1; i < len; i++) {
    const prev = trajectory[i - 1];
    const curr = trajectory[i];

    // Normalized progress 0..1 through the trail
    const progress = i / len;

    // Opacity is kept higher so older segments do not fade to invisibility
    const alpha = progress * 0.35 + 0.45;

    // Darker color values: deep violet (start) to deep cyan (end)
    const r = Math.floor(75 * (1 - progress));
    const g = Math.floor(35 * (1 - progress) + 140 * progress);
    const b = Math.floor(150 * (1 - progress) + 160 * progress);

    // Breathing pulse on recent portion
    const breathe = i > len * 0.7 ? 0.8 + 0.2 * Math.sin(time * 3 + i * 0.1) : 1;

    ctx.beginPath();
    ctx.moveTo(prev.x * width, prev.y * height);
    ctx.lineTo(curr.x * width, curr.y * height);

    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * breathe})`;
    ctx.lineWidth = 1.2 + progress * 1.8;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Draw dots at key trajectory points (every 15th point)
  for (let i = 0; i < len; i += 15) {
    const p = trajectory[i];
    const progress = i / len;
    const dotAlpha = 0.2 + progress * 0.5;

    ctx.beginPath();
    ctx.arc(p.x * width, p.y * height, 1.5 + progress * 1, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 229, 255, ${dotAlpha})`;
    ctx.fill();
  }

  // Bright dot at the most recent position
  if (len > 0) {
    const last = trajectory[len - 1];
    const pulse = 0.7 + 0.3 * Math.sin(time * 4);

    ctx.beginPath();
    ctx.arc(last.x * width, last.y * height, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 229, 255, ${pulse})`;
    ctx.fill();
  }

  ctx.restore();
}
