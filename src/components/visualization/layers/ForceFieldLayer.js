const lerp = (a, b, t) => a + (b - a) * t;

export function renderForceFieldLayer(ctx, width, height, { forceField, maxMagnitude }) {
  if (!forceField || forceField.length === 0) return;

  // Fallback if maxMagnitude isn't passed
  let maxMag = maxMagnitude;
  if (maxMag === undefined) {
    const allMagnitudes = forceField.flat().map(f => Math.sqrt(f.x * f.x + f.y * f.y));
    maxMag = Math.max(...allMagnitudes, 0.001);
  }

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

      const fx = force.x;
      const fy = force.y;
      const magnitude = Math.sqrt(fx * fx + fy * fy);
      if (magnitude < 0.003) continue; // skip near-zero vectors — empty space is honest

      // Find the maximum magnitude across entire grid (compute once per frame, store in ref)
      // mapRange: maps [0, maxMag] → [4, 28] px
      const arrowLen = 4 + (magnitude / maxMag) * 24; // length IS magnitude

      const nx = fx / magnitude; // normalized direction
      const ny = fy / magnitude;
      const ex = cx + nx * arrowLen;
      const ey = cy + ny * arrowLen;

      // Color by magnitude: low = dim violet, high = bright cyan
      const t = magnitude / maxMag; // 0 to 1
      const r = Math.round(lerp(124, 0, t));    // 124→0
      const g = Math.round(lerp(58, 229, t));   // 58→229
      const b = Math.round(lerp(237, 255, t));  // 237→255
      const alpha = 0.25 + t * 0.45;

      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.lineWidth = 0.8 + t * 0.6;

      // Shaft
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Filled triangle arrowhead (NOT a line — a proper arrowhead)
      const headLen = 4 + t * 3;
      const headAngle = 0.38; // radians (~22°)
      const angle = Math.atan2(ny, nx);

      ctx.beginPath();
      ctx.moveTo(ex, ey); // tip
      ctx.lineTo(
        ex - headLen * Math.cos(angle - headAngle),
        ey - headLen * Math.sin(angle - headAngle)
      );
      ctx.lineTo(
        ex - headLen * Math.cos(angle + headAngle),
        ey - headLen * Math.sin(angle + headAngle)
      );
      ctx.closePath();
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha + 0.1})`;
      ctx.fill();
    }
  }

  ctx.restore();
}
