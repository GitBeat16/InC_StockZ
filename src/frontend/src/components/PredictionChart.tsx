import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface PredictionChartProps {
  dates: string[];
  closes: number[];
  predicted: number[];
  nextDayPrediction: number;
  slope: number;
}

const BG = "#0F1113";
const CARD_BG = "#1A1D20";
const BORDER = "#2A2F34";
const MUTED = "#9AA3AA";

export function PredictionChart({
  dates,
  closes,
  predicted,
  nextDayPrediction,
  slope,
}: PredictionChartProps) {
  // Sample data to at most 120 points for performance
  const step = Math.max(1, Math.floor(dates.length / 120));
  const chartData = dates
    .filter((_, i) => i % step === 0)
    .map((date, idx) => {
      const origIdx = idx * step;
      return {
        date: date.slice(5),
        actual: Math.round(closes[origIdx] * 100) / 100,
        predicted: Math.round(predicted[origIdx] * 100) / 100,
      };
    });

  // Add next day prediction
  const lastDate = dates[dates.length - 1];
  const nextDate = lastDate
    ? (() => {
        const d = new Date(lastDate);
        d.setDate(d.getDate() + 1);
        return d.toISOString().slice(5, 10);
      })()
    : "";

  if (nextDate) {
    chartData.push({
      date: nextDate,
      actual: null as any,
      predicted: Math.round(nextDayPrediction * 100) / 100,
    });
  }

  const trendDirection = slope > 0 ? "Upward" : "Downward";
  const trendColor = slope > 0 ? "#35D07F" : "#E25555";

  return (
    <div
      className="rounded-lg border border-border p-4"
      style={{ background: CARD_BG }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
            ML Trend Prediction
          </p>
          <p className="text-sm font-semibold">Linear Regression Model</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground mb-0.5">Next Day</p>
          <p
            className="text-lg font-bold font-mono"
            style={{ color: trendColor }}
          >
            ${nextDayPrediction.toFixed(2)}
          </p>
          <p className="text-[10px]" style={{ color: trendColor }}>
            {trendDirection} trend
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={chartData}
          margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
          <XAxis
            dataKey="date"
            tick={{ fill: MUTED, fontSize: 10 }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: MUTED, fontSize: 10 }}
            tickLine={false}
            domain={["auto", "auto"]}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              fontSize: 11,
            }}
            labelStyle={{ color: MUTED }}
            formatter={(value: any) => [`$${value}`, ""]}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: MUTED }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#2EC4A6"
            strokeWidth={1.5}
            dot={false}
            name="Actual"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#fb923c"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
            name="Regression"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
