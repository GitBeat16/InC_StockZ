export interface PredictionResult {
  predicted: number[];
  nextDayPrediction: number;
  slope: number;
  intercept: number;
}

export function linearRegression(closes: number[]): PredictionResult {
  const n = closes.length;
  if (n < 2) {
    return {
      predicted: closes.slice(),
      nextDayPrediction: closes[n - 1] ?? 0,
      slope: 0,
      intercept: closes[0] ?? 0,
    };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += closes[i];
    sumXY += i * closes[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const predicted = closes.map((_, i) => slope * i + intercept);
  const nextDayPrediction = slope * n + intercept;

  return { predicted, nextDayPrediction, slope, intercept };
}
