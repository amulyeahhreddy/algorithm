/**
 * GradientDescentLayer — renders a dashed optimization arrow pointing in the 
 * direction of the recommendation force vector (the steepest descent optimization path).
 */

export function renderGradientDescentLayer(ctx, width, height, { userPos, recommendationForce, time }) {
  if (!userPos || !recommendationForce) return;

  const fx = recommendationForce.x;
  const fy = recommendationForce.y;
  const mag = Math.sqrt(fx * fx + fy * fy);
  if (mag < 0.001) return; // Silent if force is negligible

  const startX = userPos.x * width;
  const startY = userPos.y * height;

  // Normalized direction
  const dx = fx / mag;
  const dy = fy / mag;

  // Visual length of arrow: base size + scaled force contribution
  const arrowLength = 32 + Math.min(24, mag * 800);
  const endX = startX + dx * arrowLength;
  const endY = startY + dy * arrowLength;

  ctx.save();

  // Lime green colors for optimization themes
  const color = '#39D353';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;

  // 1. Draw dashed animated arrow shaft
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.setLineDash([4, 4]);
  // Animate flow direction: offset moves backward to make dashes flow outward
  ctx.lineDashOffset = -time * 25;
  ctx.stroke();

  // 2. Draw solid arrow head at the tip
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;

  const headAngle = Math.atan2(fy, fx);
  const headLen = 6;
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLen * Math.cos(headAngle - 0.45),
    endY - headLen * Math.sin(headAngle - 0.45)
  );
  ctx.lineTo(
    endX - headLen * Math.cos(headAngle + 0.45),
    endY - headLen * Math.sin(headAngle + 0.45)
  );
  ctx.closePath();
  ctx.fill();

  // 3. Draw text label '∇ optimize'
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.letterSpacing = '0.05em';
  
  // Decide label offset to avoid overlaps
  let textAlign = 'left';
  let labelX = endX + dx * 8;
  let labelY = endY + dy * 8 + 3;

  if (dx < -0.3) {
    textAlign = 'right';
  } else if (Math.abs(dx) <= 0.3) {
    textAlign = 'center';
  }

  ctx.textAlign = textAlign;
  ctx.fillText('∇ optimize', labelX, labelY);

  ctx.restore();
}
