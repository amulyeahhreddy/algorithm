/**
 * UserLayer — renders the user's current position as a pulsing indicator
 * Multi-ring animated cursor with velocity direction indicator.
 */

export function renderUserLayer(ctx, width, height, { userPos, userVelocity, time }) {
  if (!userPos) return;

  const x = userPos.x * width;
  const y = userPos.y * height;

  ctx.save();

  // Outer scanning ring — rotates slowly
  const scanRadius = 22 + 4 * Math.sin(time * 1.5);
  const scanAngle = time * 0.8;

  ctx.beginPath();
  ctx.arc(x, y, scanRadius, scanAngle, scanAngle + Math.PI * 1.2);
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, scanRadius, scanAngle + Math.PI, scanAngle + Math.PI * 1.6);
  ctx.strokeStyle = 'rgba(124, 58, 237, 0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Middle ring — pulse
  const midPulse = 0.7 + 0.3 * Math.sin(time * 3);
  const midRadius = 12 * midPulse;

  ctx.beginPath();
  ctx.arc(x, y, midRadius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(0, 229, 255, ${0.3 + midPulse * 0.3})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Core glow
  const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, 8);
  coreGrad.addColorStop(0, 'rgba(0, 229, 255, 0.9)');
  coreGrad.addColorStop(0.4, 'rgba(0, 229, 255, 0.4)');
  coreGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');

  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fillStyle = coreGrad;
  ctx.fill();

  // Center bright dot
  const centerPulse = 0.8 + 0.2 * Math.sin(time * 5);
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 255, ${centerPulse})`;
  ctx.fill();

  // Velocity direction indicator arrow
  if (userVelocity) {
    const vMag = Math.sqrt(userVelocity.x * userVelocity.x + userVelocity.y * userVelocity.y);
    if (vMag > 0.0005) {
      const vAngle = Math.atan2(userVelocity.y, userVelocity.x);
      const arrowLen = Math.min(30, vMag * 800);
      const ax = x + Math.cos(vAngle) * (scanRadius + 4);
      const ay = y + Math.sin(vAngle) * (scanRadius + 4);
      const bx = x + Math.cos(vAngle) * (scanRadius + 4 + arrowLen);
      const by = y + Math.sin(vAngle) * (scanRadius + 4 + arrowLen);

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Arrow head
      const headLen = 5;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx - Math.cos(vAngle - 0.4) * headLen, by - Math.sin(vAngle - 0.4) * headLen);
      ctx.moveTo(bx, by);
      ctx.lineTo(bx - Math.cos(vAngle + 0.4) * headLen, by - Math.sin(vAngle + 0.4) * headLen);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
      ctx.stroke();
    }
  }

  // Coordinates label
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';
  ctx.fillText(
    `(${userPos.x.toFixed(3)}, ${userPos.y.toFixed(3)})`,
    x,
    y + scanRadius + 16
  );

  ctx.restore();
}
