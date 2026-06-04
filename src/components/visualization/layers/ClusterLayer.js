/**
 * ClusterLayer — renders cluster centers with pulsing halos and labels
 */

export function renderClusterLayer(ctx, width, height, { clusters, userPos, time }) {
  if (!clusters || clusters.length === 0) return;

  ctx.save();

  clusters.forEach((cluster) => {
    const cx = cluster.pos.x * width;
    const cy = cluster.pos.y * height;

    // Distance from user to this cluster center (for glow intensity)
    const dx = (userPos?.x || 0.5) - cluster.pos.x;
    const dy = (userPos?.y || 0.5) - cluster.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const proximity = Math.max(0, 1 - dist * 2); // 0..1, stronger when closer

    // Pulsing ring animation
    const pulse = 0.7 + 0.3 * Math.sin(time * 2 + cluster.pos.x * 10);
    const outerPulse = 0.5 + 0.5 * Math.sin(time * 1.2 + cluster.pos.y * 8);

    // Outer halo ring — expands/contracts
    const outerRadius = 28 + outerPulse * 16 + proximity * 12;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerRadius);
    gradient.addColorStop(0, cluster.color + '40');
    gradient.addColorStop(0.5, cluster.color + '18');
    gradient.addColorStop(1, cluster.color + '00');

    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Middle pulsing ring
    const midRadius = 14 + pulse * 6;
    ctx.beginPath();
    ctx.arc(cx, cy, midRadius, 0, Math.PI * 2);
    ctx.strokeStyle = cluster.color + '60';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Inner core dot
    const coreRadius = 5 + pulse * 2;
    const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
    coreGradient.addColorStop(0, cluster.color);
    coreGradient.addColorStop(0.6, cluster.color + 'AA');
    coreGradient.addColorStop(1, cluster.color + '00');

    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
    ctx.fillStyle = coreGradient;
    ctx.fill();

    // Bright center pixel
    ctx.beginPath();
    ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Label
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = cluster.color + 'CC';
    ctx.fillText(cluster.label.toUpperCase(), cx, cy + outerRadius + 6);

    // Cluster ID tag
    ctx.font = '8px "IBM Plex Mono", monospace';
    ctx.fillStyle = cluster.color + '80';
    ctx.fillText(`[${cluster.id}]`, cx, cy + outerRadius + 20);
  });

  ctx.restore();
}
