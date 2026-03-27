import type { BacktestResult } from "@/utils/backtesting";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BacktestResultsProps {
  result: BacktestResult;
}

const BG = "#0F1113";
const CARD_BG = "#1A1D20";
const BORDER = "#2A2F34";
const MUTED = "#9AA3AA";

export function BacktestResults({ result }: BacktestResultsProps) {
  const isProfit = result.totalReturn >= 0;

  // Sample equity curve
  const step = Math.max(1, Math.floor(result.equityCurve.length / 120));
  const equityData = result.equityCurve.filter((_, i) => i % step === 0);

  return (
    <div
      data-ocid="backtest.card"
      className="rounded-lg border border-border p-4"
      style={{ background: CARD_BG }}
    >
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
        Backtesting Results
      </p>
      <p className="text-sm font-semibold mb-4">
        SMA 20 / 50 Crossover Strategy
      </p>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div
          className="rounded-md p-3 border border-border"
          style={{ background: "oklch(0.19 0.005 250)" }}
        >
          <p className="text-[10px] text-muted-foreground mb-1">Total Return</p>
          <div
            className={`flex items-center gap-1 text-base font-bold font-mono ${
              isProfit ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isProfit ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {isProfit ? "+" : ""}
            {result.totalReturn.toFixed(2)}%
          </div>
        </div>
        <div
          className="rounded-md p-3 border border-border"
          style={{ background: "oklch(0.19 0.005 250)" }}
        >
          <p className="text-[10px] text-muted-foreground mb-1">Sharpe Ratio</p>
          <p
            className={`text-base font-bold font-mono ${
              result.sharpeRatio >= 1
                ? "text-emerald-400"
                : result.sharpeRatio >= 0
                  ? "text-yellow-400"
                  : "text-red-400"
            }`}
          >
            {result.sharpeRatio.toFixed(2)}
          </p>
        </div>
        <div
          className="rounded-md p-3 border border-border"
          style={{ background: "oklch(0.19 0.005 250)" }}
        >
          <p className="text-[10px] text-muted-foreground mb-1">Win Rate</p>
          <p className="text-base font-bold font-mono text-foreground">
            {result.winRate.toFixed(1)}%
          </p>
        </div>
        <div
          className="rounded-md p-3 border border-border"
          style={{ background: "oklch(0.19 0.005 250)" }}
        >
          <p className="text-[10px] text-muted-foreground mb-1">Trades</p>
          <p className="text-base font-bold font-mono text-foreground">
            {result.totalTrades}
          </p>
        </div>
      </div>

      {/* Equity curve */}
      {equityData.length > 0 && (
        <>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
            Equity Curve
          </p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart
              data={equityData}
              margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
              <XAxis
                dataKey="date"
                tick={{ fill: MUTED, fontSize: 9 }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: MUTED, fontSize: 9 }}
                tickLine={false}
                domain={["auto", "auto"]}
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  fontSize: 11,
                }}
                labelStyle={{ color: MUTED }}
                formatter={(v: any) => [`$${v.toFixed(2)}`, "Equity"]}
              />
              <Line
                type="monotone"
                dataKey="equity"
                stroke="#2EC4A6"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
      {equityData.length === 0 && (
        <div
          data-ocid="backtest.empty_state"
          className="text-center py-8 text-muted-foreground text-sm"
        >
          Not enough data for backtesting
        </div>
      )}
    </div>
  );
}
