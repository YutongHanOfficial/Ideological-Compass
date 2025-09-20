// scoring.js
// Exports utility functions for scoring and normalization.

export function scoreResponses(responses, questions) {
  // responses: map id -> numeric response in [-3..3] where:
  // -3 = Strongly disagree, -2 = Disagree, -1 = Slightly disagree, 0 = Neutral, 1 = Slightly agree, 2 = Agree, 3 = Strongly agree
  // questions: array of question objects from questions.js
  const axisTotals = { compassX:0, compassY:0, values:{} };
  const axisWeights = { compassX:0, compassY:0, values:{} };

  for (const q of questions) {
    if (!(q.id in responses)) continue;
    let raw = responses[q.id];
    if (q.reverse) raw = -raw;
    // compass axes
    if (q.axes?.compassX) {
      const w = q.axes.compassX;
      axisTotals.compassX += raw * w;
      axisWeights.compassX += Math.abs(w);
    }
    if (q.axes?.compassY) {
      const w = q.axes.compassY;
      axisTotals.compassY += raw * w;
      axisWeights.compassY += Math.abs(w);
    }
    // values (object of many)
    if (q.axes?.values) {
      for (const [k,w] of Object.entries(q.axes.values)) {
        axisTotals.values[k] = (axisTotals.values[k] ?? 0) + raw * w;
        axisWeights.values[k] = (axisWeights.values[k] ?? 0) + Math.abs(w);
      }
    }
  }

  // Normalize: convert compass axes to -10..+10 for display
  const compass = { x:0, y:0 };
  if (axisWeights.compassX) compass.x = (axisTotals.compassX / (axisWeights.compassX*3)) * 10;
  if (axisWeights.compassY) compass.y = (axisTotals.compassY / (axisWeights.compassY*3)) * 10;

  // Values: produce 0..100 percentage for each value axis.
  const valuesPercent = {};
  for (const [k,total] of Object.entries(axisTotals.values)) {
    const w = axisWeights.values[k] || 1;
    const pct = ((total / (w*3)) + 1) / 2 * 100; // map from [-1..1] to [0..100]
    valuesPercent[k] = Math.min(100, Math.max(0, Math.round(pct)));
  }

  return { compass, values: valuesPercent, raw: axisTotals, weights: axisWeights };
}

// Helper to create shareable result object
export function serializeResult(userMeta, scores, responses) {
  return {
    meta: userMeta ?? {},
    scores,
    responses,
    timestamp: new Date().toISOString()
  };
}
