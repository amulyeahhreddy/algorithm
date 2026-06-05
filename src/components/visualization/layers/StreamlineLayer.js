/**
 * StreamlineLayer — integral curves of the recommendation force field.
 * Thin curved paths show where the field "flows," converging toward cluster attractors.
 * Seed points use a Halton low-discrepancy sequence for uniform, non-random coverage.
 */

// ── Bilinear-interpolated force field lookup ──
function sampleField(x, y, forceField) {
  const gx = Math.min(19, Math.floor(x * 20));
  const gy = Math.min(19, Math.floor(y * 20));
  return forceField[gx]?.[gy] ?? { x: 0, y: 0 };
}

// ── Euler integration along normalized field direction ──
function computeStreamline(startX, startY, forceField, steps = 80, dt = 0.003) {
  const path = [{ x: startX, y: startY }];
  let x = startX;
  let y = startY;

  for (let i = 0; i < steps; i++) {
    const f = sampleField(x, y, forceField);
    const mag = Math.sqrt(f.x * f.x + f.y * f.y);
    if (mag < 0.001) break; // stop in zero-force regions

    x = Math.max(0.01, Math.min(0.99, x + (f.x / mag) * dt));
    y = Math.max(0.01, Math.min(0.99, y + (f.y / mag) * dt));
    path.push({ x, y });
  }
  return path;
}

// ── Halton low-discrepancy sequence for well-distributed seed points ──
function halton(index, base) {
  let result = 0;
  let f = 1;
  let i = index;
  while (i > 0) {
    f /= base;
    result += f * (i % base);
    i = Math.floor(i / base);
  }
  return result;
}

export function renderStreamlines(ctx, canvasW, canvasH, forceField, numLines = 28) {
  if (!forceField || forceField.length === 0) return;

  ctx.save();

  for (let i = 0; i < numLines; i++) {
    const sx = halton(i + 1, 2); // base-2 Halton → x seed
    const sy = halton(i + 1, 3); // base-3 Halton → y seed
    const path = computeStreamline(sx, sy, forceField);
    if (path.length < 4) continue;

    // ── Draw streamline shaft ──
    ctx.beginPath();
    ctx.moveTo(path[0].x * canvasW, path[0].y * canvasH);
    for (let j = 1; j < path.length; j++) {
      ctx.lineTo(path[j].x * canvasW, path[j].y * canvasH);
    }
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // ── Filled arrowhead at streamline midpoint ──
    const mid = Math.floor(path.length / 2);
    if (mid > 0) {
      const ax = ((path[mid - 1].x + path[mid].x) / 2) * canvasW;
      const ay = ((path[mid - 1].y + path[mid].y) / 2) * canvasH;
      const angle = Math.atan2(
        path[mid].y - path[mid - 1].y,
        path[mid].x - path[mid - 1].x
      );
      const hLen = 5;

      ctx.beginPath();
      ctx.moveTo(
        ax + Math.cos(angle) * hLen,
        ay + Math.sin(angle) * hLen
      );
      ctx.lineTo(
        ax - hLen * Math.cos(angle - 0.45),
        ay - hLen * Math.sin(angle - 0.45)
      );
      ctx.lineTo(
        ax - hLen * Math.cos(angle + 0.45),
        ay - hLen * Math.sin(angle + 0.45)
      );
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 229, 255, 0.20)';
      ctx.fill();
    }
  }

  ctx.restore();
}
