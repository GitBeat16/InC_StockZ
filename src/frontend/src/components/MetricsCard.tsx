import { Activity, Minus, TrendingDown, TrendingUp } from "lucide-react";

interface MetricsCardProps {
  ticker: string;
  lastClose: number;
  priceChange: number;
  priceChangePct: number;
  signal: "BUY" | "SELL" | "HOLD";
  rsiValue: number | null;
  volume: number;
}

const SIGNAL_CONFIG = {
  BUY: {
    color: "text-emerald-400",
    bg: "bg-emerald-400/15 border-emerald-400/30",
    icon: TrendingUp,
  },
  SELL: {
    color: "text-red-400",
    bg: "bg-red-400/15 border-red-400/30",
    icon: TrendingDown,
  },
  HOLD: {
    color: "text-yellow-400",
    bg: "bg-yellow-400/15 border-yellow-400/30",
    icon: Minus,
  },
};

function formatVolume(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toString();
}

export function MetricsCard({
  ticker,
  lastClose,
  priceChange,
  priceChangePct,
  signal,
  rsiValue,
  volume,
}: MetricsCardProps) {
  const cfg = SIGNAL_CONFIG[signal];
  const SignalIcon = cfg.icon;
  const isPositive = priceChange >= 0;

  return (
    <div
      data-ocid="metrics.card"
      className="rounded-lg border border-border p-4"
      style={{ background: "oklch(0.155 0.004 250)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">
            Daily Summary
          </p>
          <p className="text-base font-bold font-mono tracking-tight">
            {ticker}
          </p>
        </div>
        <Activity className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Price */}
      <div className="mb-3">
        <p className="text-2xl font-bold font-mono">${lastClose.toFixed(2)}</p>
        <div
          className={`flex items-center gap-1 mt-0.5 text-sm font-mono ${
            isPositive ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          <span>
            {isPositive ? "+" : ""}
            {priceChange.toFixed(2)} ({isPositive ? "+" : ""}
            {priceChangePct.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Signal */}
      <div className="mb-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">
          Signal
        </p>
        <div
          data-ocid="metrics.signal.card"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-bold ${cfg.color} ${cfg.bg}`}
        >
          <SignalIcon className="w-3.5 h-3.5" />
          {signal}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div
          className="rounded-md p-2.5 border border-border"
          style={{ background: "oklch(0.19 0.005 250)" }}
        >
          <p className="text-[10px] text-muted-foreground mb-1">RSI (14)</p>
          <p
            className={`text-sm font-bold font-mono ${
              rsiValue !== null && rsiValue > 70
                ? "text-red-400"
                : rsiValue !== null && rsiValue < 30
                  ? "text-emerald-400"
                  : "text-foreground"
            }`}
          >
            {rsiValue !== null ? rsiValue.toFixed(1) : "—"}
          </p>
          <p className="text-[9px] text-muted-foreground mt-0.5">
            {rsiValue !== null && rsiValue > 70
              ? "Overbought"
              : rsiValue !== null && rsiValue < 30
                ? "Oversold"
                : "Neutral"}
          </p>
        </div>
        <div
          className="rounded-md p-2.5 border border-border"
          style={{ background: "oklch(0.19 0.005 250)" }}
        >
          <p className="text-[10px] text-muted-foreground mb-1">Volume</p>
          <p className="text-sm font-bold font-mono">{formatVolume(volume)}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">
            Last session
          </p>
        </div>
      </div>
    </div>
  );
}
