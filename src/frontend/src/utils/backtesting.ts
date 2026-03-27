import type { OHLCVData } from "./dataFetcher";
import { calcSMA } from "./indicators";

export interface BacktestResult {
  totalReturn: number;
  sharpeRatio: number;
  winRate: number;
  totalTrades: number;
  equityCurve: { date: string; equity: number }[];
}

export function runBacktest(data: OHLCVData[]): BacktestResult {
  if (data.length < 60) {
    return {
      totalReturn: 0,
      sharpeRatio: 0,
      winRate: 0,
      totalTrades: 0,
      equityCurve: [],
    };
  }

  const closes = data.map((d) => d.close);
  const sma20 = calcSMA(closes, 20);
  const sma50 = calcSMA(closes, 50);

  let cash = 10000;
  let position = 0;
  let entryPrice = 0;
  const trades: { profit: number }[] = [];
  const equityCurve: { date: string; equity: number }[] = [];
  const dailyReturns: number[] = [];
  let prevEquity = cash;

  for (let i = 51; i < data.length; i++) {
    const prevSMA20 = sma20[i - 1];
    const currSMA20 = sma20[i];
    const prevSMA50 = sma50[i - 1];
    const currSMA50 = sma50[i];
    const price = closes[i];

    if (
      prevSMA20 !== null &&
      currSMA20 !== null &&
      prevSMA50 !== null &&
      currSMA50 !== null
    ) {
      if (prevSMA20 <= prevSMA50 && currSMA20 > currSMA50 && position === 0) {
        position = Math.floor(cash / price);
        entryPrice = price;
        cash -= position * price;
      } else if (
        prevSMA20 >= prevSMA50 &&
        currSMA20 < currSMA50 &&
        position > 0
      ) {
        const proceeds = position * price;
        const profit = proceeds - position * entryPrice;
        trades.push({ profit });
        cash += proceeds;
        position = 0;
        entryPrice = 0;
      }
    }

    const currentEquity = cash + position * price;
    const dailyReturn =
      prevEquity > 0 ? (currentEquity - prevEquity) / prevEquity : 0;
    dailyReturns.push(dailyReturn);
    prevEquity = currentEquity;
    equityCurve.push({
      date: data[i].time,
      equity: Math.round(currentEquity * 100) / 100,
    });
  }

  if (position > 0) {
    const lastPrice = closes[closes.length - 1];
    const proceeds = position * lastPrice;
    trades.push({ profit: proceeds - position * entryPrice });
    cash += proceeds;
  }

  const finalEquity = equityCurve[equityCurve.length - 1]?.equity ?? 10000;
  const totalReturn = ((finalEquity - 10000) / 10000) * 100;
  const winningTrades = trades.filter((t) => t.profit > 0).length;
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;

  const avgReturn =
    dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const variance =
    dailyReturns.reduce((a, b) => a + (b - avgReturn) ** 2, 0) /
    dailyReturns.length;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

  return {
    totalReturn: Math.round(totalReturn * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    winRate: Math.round(winRate * 100) / 100,
    totalTrades: trades.length,
    equityCurve,
  };
}
