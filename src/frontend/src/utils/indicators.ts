export function calcSMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += data[j];
      result.push(sum / period);
    }
  }
  return result;
}

export function calcEMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const k = 2 / (period + 1);
  let ema: number | null = null;
  for (let i = 0; i < data.length; i++) {
    if (ema === null) {
      if (i < period - 1) {
        result.push(null);
        continue;
      }
      // seed with SMA
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += data[j];
      ema = sum / period;
    } else {
      ema = data[i] * k + ema * (1 - k);
    }
    result.push(ema);
  }
  return result;
}

export function calcRSI(data: number[], period = 14): (number | null)[] {
  const result: (number | null)[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }

  result.push(null); // index 0
  for (let i = 0; i < gains.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    let avgGain: number;
    let avgLoss: number;
    if (i === period - 1) {
      avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
      avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
    } else {
      const prevRSIIdx = i - 1;
      // get previous avg values from result
      // recalculate using Wilder's smoothing
      const prevResult = result[prevRSIIdx + 1];
      if (prevResult === null) {
        result.push(null);
        continue;
      }
      // We need prevAvgGain and prevAvgLoss — track them
      result.push(null); // placeholder, will recalculate below
      continue;
    }
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - 100 / (1 + rs));
  }

  // Redo with Wilder's smoothing properly
  const result2: (number | null)[] = new Array(data.length).fill(null);
  if (data.length <= period) return result2;

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = data[i] - data[i - 1];
    if (diff > 0) avgGain += diff;
    else avgLoss += -diff;
  }
  avgGain /= period;
  avgLoss /= period;
  const rs0 = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result2[period] = 100 - 100 / (1 + rs0);

  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result2[i] = 100 - 100 / (1 + rs);
  }
  return result2;
}

export function calcMACD(data: number[]): {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
} {
  const ema12 = calcEMA(data, 12);
  const ema26 = calcEMA(data, 26);
  const macd: (number | null)[] = ema12.map((v, i) =>
    v !== null && ema26[i] !== null ? v - ema26[i]! : null,
  );

  // Signal line: 9-period EMA of MACD (only on non-null values)
  const macdValues = macd.filter((v): v is number => v !== null);
  const signalValues = calcEMA(macdValues, 9);

  // Map back to original indices
  const signal: (number | null)[] = new Array(data.length).fill(null);
  const histogram: (number | null)[] = new Array(data.length).fill(null);
  let j = 0;
  for (let i = 0; i < macd.length; i++) {
    if (macd[i] !== null) {
      signal[i] = signalValues[j] ?? null;
      if (signal[i] !== null) {
        histogram[i] = macd[i]! - signal[i]!;
      }
      j++;
    }
  }

  return { macd, signal, histogram };
}

export function getSignal(
  closes: number[],
  rsi: (number | null)[],
): "BUY" | "SELL" | "HOLD" {
  if (closes.length < 51) return "HOLD";
  const n = closes.length;
  const lastClose = closes[n - 1];
  const sma20 = closes.slice(n - 20).reduce((a, b) => a + b, 0) / 20;
  const sma50 = closes.slice(n - 50).reduce((a, b) => a + b, 0) / 50;
  const lastRSI = rsi[n - 1];

  if (lastRSI === null) return "HOLD";

  // BUY: RSI < 40, price above SMA20, SMA20 crossing above SMA50
  if (lastRSI < 40 && lastClose > sma20 * 0.98) return "BUY";
  // SELL: RSI > 60, price below SMA20, SMA20 below SMA50
  if (lastRSI > 60 && lastClose < sma20 * 1.02 && sma20 < sma50 * 1.01)
    return "SELL";
  // Additional: SMA20 strongly above SMA50 and RSI > 55 → BUY
  if (sma20 > sma50 * 1.005 && lastRSI > 45 && lastRSI < 65) return "BUY";
  return "HOLD";
}
