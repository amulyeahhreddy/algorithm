/**
 * PhaseAxesLayer — renders coordinate axes and grid lines on the phase plane.
 */

export function renderPhaseAxes(ctx, canvasW, canvasH) {
  const cx = canvasW * 0.5;
  const cy = canvasH * 0.5;

  ctx.save();

  // ── Faint background grid (0.25 interval) ──
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.032)';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([3, 8]);
  for (let i = 1; i < 4; i++) {
    const gx = canvasW * (i / 4);
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, canvasH); ctx.stroke();
    const gy = canvasH * (i / 4);
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(canvasW, gy); ctx.stroke();
  }
  ctx.setLineDash([]);

  // ── Main axes (through center) ──
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
  ctx.lineWidth = 0.8;
  ctx.setLineDash([4, 6]);

  // X-axis
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(canvasW, cy); ctx.stroke();
  // Y-axis
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, canvasH); ctx.stroke();
  ctx.setLineDash([]);

  // ── Tick marks at 0.25 intervals ──
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1;
  const tickLen = 5;
  for (let i = 1; i < 4; i++) {
    const gx = canvasW * (i / 4);
    ctx.beginPath(); ctx.moveTo(gx, cy - tickLen); ctx.lineTo(gx, cy + tickLen); ctx.stroke();
    const gy = canvasH * (i / 4);
    ctx.beginPath(); ctx.moveTo(cx - tickLen, gy); ctx.lineTo(cx + tickLen, gy); ctx.stroke();
  }

  // ── Axis labels ──
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = 'rgba(136, 146, 164, 0.65)'; // --text-secondary, dimmed

  // X-axis label (right end)
  ctx.textAlign = 'right';
  ctx.fillText('PC₁ →', canvasW - 10, cy - 8);

  // Y-axis label (top, rotated)
  ctx.save();
  ctx.translate(cx + 10, 16);
  ctx.textAlign = 'left';
  ctx.fillText('PC₂', 0, 0);
  ctx.restore();

  // Origin label
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(136, 146, 164, 0.35)';
  ctx.fillText('O', cx + 10, cy - 8);

  ctx.restore();
}
