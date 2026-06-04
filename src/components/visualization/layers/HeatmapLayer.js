/**
 * HeatmapLayer — renders an 80×80 cached similarity heatmap
 * Uses offscreen canvas + ImageData for performant pixel-level rendering.
 * Recomputes only when scores change (via dirty flag).
 */
import { cosineSimilarity } from '../../../engine/VectorMath';

const GRID = 80;
let cachedImageData = null;
let cacheKey = '';

/**
 * Build a heat color from a normalized value [0,1]
 * 0.0 = deep void (#06080D)
 * 0.3 = violet glow
 * 0.6 = cyan
 * 1.0 = white-hot
 */
function heatColor(t) {
  t = Math.max(0, Math.min(1, t));

  if (t < 0.25) {
    const s = t / 0.25;
    return [
      6 + s * 50,            // R: 6 → 56
      8 + s * 12,            // G: 8 → 20
      13 + s * 80,           // B: 13 → 93
      Math.floor(40 + s * 80) // A: subtle start
    ];
  } else if (t < 0.5) {
    const s = (t - 0.25) / 0.25;
    return [
      56 + s * 68,           // R: 56 → 124
      20 - s * 5,            // G: 20 → 15
      93 + s * 144,          // B: 93 → 237
      Math.floor(120 + s * 40)
    ];
  } else if (t < 0.75) {
    const s = (t - 0.5) / 0.25;
    return [
      124 - s * 124,         // R: 124 → 0
      15 + s * 214,          // G: 15 → 229
      237 + s * 18,          // B: 237 → 255
      Math.floor(160 + s * 40)
    ];
  } else {
    const s = (t - 0.75) / 0.25;
    return [
      s * 180,               // R: 0 → 180
      229 + s * 26,          // G: 229 → 255
      255,                   // B: 255
      Math.floor(200 + s * 55)
    ];
  }
}

function computeHeatmapData(userVector, contentItems, width, height) {
  const imageData = new ImageData(GRID, GRID);
  const data = imageData.data;

  // Pre-compute content 2D positions for sampling
  // For each grid cell, compute average similarity to nearby content
  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      // Normalized position of this grid cell
      const nx = (gx + 0.5) / GRID;
      const ny = (gy + 0.5) / GRID;

      // Interpolate a synthetic vector at this position based on nearby content
      // Weight by inverse distance to content positions
      let totalWeight = 0;
      let weightedSim = 0;

      contentItems.forEach((item) => {
        if (!item.pos2d) return;
        const dx = nx - item.pos2d.x;
        const dy = ny - item.pos2d.y;
        const distSq = dx * dx + dy * dy;
        const w = 1 / (distSq + 0.01); // inverse distance weighting with softening
        const sim = cosineSimilarity(userVector, item.vector);
        weightedSim += w * sim;
        totalWeight += w;
      });

      const value = totalWeight > 0 ? weightedSim / totalWeight : 0;
      // Apply a power curve for visual contrast
      const curved = Math.pow(value, 1.5);

      const [r, g, b, a] = heatColor(curved);
      const idx = (gy * GRID + gx) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = a;
    }
  }

  return imageData;
}

export function renderHeatmapLayer(ctx, width, height, { userVector, contentItems }) {
  if (!userVector || !contentItems || contentItems.length === 0) return;

  // Cache key based on user vector (rounded to reduce churn)
  const key = userVector.map((v) => Math.round(v * 100)).join(',');

  if (key !== cacheKey || !cachedImageData) {
    cachedImageData = computeHeatmapData(userVector, contentItems, width, height);
    cacheKey = key;
  }

  // Draw the small ImageData to an offscreen canvas, then scale up with smoothing
  const offscreen = new OffscreenCanvas(GRID, GRID);
  const offCtx = offscreen.getContext('2d');
  offCtx.putImageData(cachedImageData, 0, 0);

  // Draw scaled with bilinear interpolation
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.globalCompositeOperation = 'screen';
  ctx.drawImage(offscreen, 0, 0, width, height);
  ctx.restore();
}
