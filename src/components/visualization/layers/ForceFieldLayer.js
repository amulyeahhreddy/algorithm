/**
 * ForceFieldLayer — renders 20×20 arrow grid showing recommendation force directions
 * Arrows point toward content the algorithm wants to pull the user towards.
 */

export function renderForceFieldLayer(ctx, width, height, { forceField, time }) {
  if (!forceField || forceField.length === 0) return;

  ctx.save();
  ctx.globalAlpha = 0.4;

  const gridSize = forceField.length; // should be 20

  for (let i = 0; i < gridSize; i++) {
    if (!forceField[i]) continue;
    for (let j = 0; j < forceField[i].length; j++) {
      const force = forceField[i][j];
      if (!force) continue;

      const cx = ((i + 0.5) / gridSize) * width;
      const cy = ((j + 0.5) / gridSize) * height;

      const mag = Math.sqrt(force.x * force.x + force.y * force.y);
      if (mag < 0.001) continue; // skip near-zero forces

      // Arrow length proportional to magnitude, capped
      const maxLen = Math.min(width, height) / gridSize * 0.7;
      const len = Math.min(mag * maxLen * 20, maxLen);

      // Direction angle
      const angle = Math.atan2(force.y, force.x);

      // Color intensity based on magnitude
      const intensity = Math.min(1, mag * 30);
      const pulse = 0.7 + 0.3 * Math.sin(time * 2 + i * 0.5 + j * 0.3);

      // Arrow shaft
      const endX = cx + Math.cos(angle) * len;
      const endY = cy + Math.sin(angle) * len;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);

      // Gradient: cyan for weak → violet for strong
      const r = Math.floor(124 * intensity);
      const g = Math.floor(58 * intensity + 229 * (1 - intensity));
      const b = Math.floor(237 * intensity + 255 * (1 - intensity));
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + intensity * 0.5 * pulse})`;
      ctx.lineWidth = 1 + intensity * 1.5;
      ctx.stroke();

      // Arrowhead
      const headLen = 4 + intensity * 4;
      const headAngle = 0.4;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - Math.cos(angle - headAngle) * headLen,
        endY - Math.sin(angle - headAngle) * headLen
      );
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - Math.cos(angle + headAngle) * headLen,
        endY - Math.sin(angle + headAngle) * headLen
      );
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.5 + intensity * 0.4})`;
      ctx.lineWidth = 1 + intensity;
      ctx.stroke();
    }
  }

  ctx.restore();
}
