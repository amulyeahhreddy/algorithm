/**
 * UserLayer — renders the user position with three simultaneous ODE component vectors.
 * dx/dt = F_rec + ε
 *   F_rec   →  Cyan   (recommendation force)
 *   dx/dt   →  Amber  (current velocity)
 *   ε       →  Coral  (exploration noise)
 */

// ── Helper: draw a labelled filled-arrowhead vector ──
function drawVector(ctx, ox, oy, dx, dy, color, width, label) {
  const ex = ox + dx;
  const ey = oy + dy;
  const angle = Math.atan2(dy, dx);
  const headLen = 6;
  const headAngle = 0.38;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;

  // Shaft
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  // Filled arrowhead
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(
    ex - headLen * Math.cos(angle - headAngle),
    ey - headLen * Math.sin(angle - headAngle)
  );
  ctx.lineTo(
    ex - headLen * Math.cos(angle + headAngle),
    ey - headLen * Math.sin(angle + headAngle)
  );
  ctx.closePath();
  ctx.fill();

  // Label — offset past the arrowhead tip
  if (label) {
    const labelDist = 8;
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.fillText(
      label,
      ex + Math.cos(angle) * labelDist,
      ey + Math.sin(angle) * labelDist
    );
  }

  ctx.restore();
}

export function renderUserLayer(ctx, width, height, { userPos, userVelocity, recommendationForce, noise, time }) {
  if (!userPos) return;

  const cx = userPos.x * width;
  const cy = userPos.y * height;

  ctx.save();

  // ── Outer glow rings ──
  const glowRings = [28, 20, 13, 7];
  const glowAlphas = [0.04, 0.07, 0.14, 0.30];
  glowRings.forEach((r, i) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 229, 255, ${glowAlphas[i]})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // ── Pulsing ring ──
  const pulseR = 10 + Math.sin(time * 3) * 2;
  ctx.beginPath();
  ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(0, 229, 255, ${0.25 + Math.sin(time * 3) * 0.12})`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Vector 1: Recommendation Force F_rec (CYAN) ──
  const fScale = 300;
  if (recommendationForce) {
    const fMag = Math.sqrt(recommendationForce.x ** 2 + recommendationForce.y ** 2);
    if (fMag > 0.003) {
      drawVector(
        ctx, cx, cy,
        recommendationForce.x * fScale,
        recommendationForce.y * fScale,
        'rgba(0, 229, 255, 0.90)',
        2.0,
        'F_rec'
      );
    }
  }

  // ── Vector 2: Current Velocity dx/dt (AMBER) ──
  const vScale = 250;
  if (userVelocity) {
    const vMag = Math.sqrt(userVelocity.x ** 2 + userVelocity.y ** 2);
    if (vMag > 0.0005) {
      drawVector(
        ctx, cx, cy,
        userVelocity.x * vScale,
        userVelocity.y * vScale,
        'rgba(255, 193, 7, 0.90)',
        2.0,
        'dx/dt'
      );
    }
  }

  // ── Vector 3: Noise ε (CORAL, smaller) ──
  const nScale = 600;
  if (noise) {
    const nMag = Math.sqrt(noise.x ** 2 + noise.y ** 2);
    if (nMag > 0.0001) {
      drawVector(
        ctx, cx, cy,
        noise.x * nScale,
        noise.y * nScale,
        'rgba(255, 71, 87, 0.65)',
        1.2,
        'ε'
      );
    }
  }

  // ── Core dot: white halo + cyan centre ──
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#00E5FF';
  ctx.fill();

  // ── Coordinates label ──
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';
  ctx.fillText(
    `(${userPos.x.toFixed(3)}, ${userPos.y.toFixed(3)})`,
    cx,
    cy + 34
  );

  ctx.restore();
}
