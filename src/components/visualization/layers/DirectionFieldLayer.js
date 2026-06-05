/**
 * DirectionFieldLayer — classic ODE slope field.
 * Short equal-length tick marks showing direction ONLY, not magnitude.
 * The visual you find in every ODE textbook for dy/dx = f(x,y).
 */

export function renderDirectionField(ctx, canvasW, canvasH, forceField) {
  if (!forceField || forceField.length === 0) return;

  ctx.save();

  const TICK_LEN = 7; // constant length — direction only, NOT magnitude
  const GRID = 22;   // denser than force-field grid → 22×22 = 484 ticks

  for (let i = 0; i < GRID; i++) {
    for (let j = 0; j < GRID; j++) {
      const nx = (i + 0.5) / GRID;
      const ny = (j + 0.5) / GRID;
      const cx = nx * canvasW;
      const cy = ny * canvasH;

      // Sample the 20×20 force field by nearest-cell lookup
      const gx = Math.min(19, Math.floor(nx * 20));
      const gy = Math.min(19, Math.floor(ny * 20));
      const f = forceField[gx]?.[gy] ?? { x: 0, y: 0 };
      const mag = Math.sqrt(f.x * f.x + f.y * f.y);
      if (mag < 0.002) continue; // skip near-zero — honest empty space

      const ux = f.x / mag; // unit direction vector
      const uy = f.y / mag;

      // Centred tick mark — half length on each side of grid point
      ctx.beginPath();
      ctx.moveTo(cx - ux * TICK_LEN * 0.5, cy - uy * TICK_LEN * 0.5);
      ctx.lineTo(cx + ux * TICK_LEN * 0.5, cy + uy * TICK_LEN * 0.5);
      ctx.strokeStyle = 'rgba(200, 200, 255, 0.22)';
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }
  }

  ctx.restore();
}
