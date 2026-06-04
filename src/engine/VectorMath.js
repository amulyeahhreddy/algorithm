export const dotProduct = (a, b) => {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
};

export const magnitude = (v) => {
  return Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
};

export const normalize = (v) => {
  const mag = magnitude(v);
  if (mag === 0) return v.map(() => 0);
  return v.map((val) => val / mag);
};

export const cosineSimilarity = (a, b) => {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  const sim = dotProduct(a, b) / (magA * magB);
  return Math.max(0, Math.min(1, sim)); // clamp to [0,1]
};

export const addVectors = (a, b) => {
  return a.map((val, i) => val + b[i]);
};

export const scaleVector = (v, scalar) => {
  return v.map((val) => val * scalar);
};

export const lerp = (a, b, t) => {
  return a + (b - a) * t;
};

export const project6Dto2D = (vector6d) => {
  const Px = [0.52, 0.38, -0.31, 0.44, -0.21, 0.30];
  const Py = [0.29, -0.45, 0.51, -0.22, 0.40, -0.48];

  let x = Px.reduce((sum, w, i) => sum + w * vector6d[i], 0);
  let y = Py.reduce((sum, w, i) => sum + w * vector6d[i], 0);

  x = (Math.tanh(x) + 1) / 2;  // maps to [0,1]
  y = (Math.tanh(y) + 1) / 2;

  return { x, y };
};
