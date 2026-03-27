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

interface ComparisonDataset {
  ticker: string;
  dates: string[];
  closes: number[];
}

interface ComparisonChartProps {
  datasets: ComparisonDataset[];
}

const BG = "#0F1113";
const CARD_BG = "#1A1D20";
const BORDER = "#2A2F34";
const MUTED = "#9AA3AA";

const COLORS = ["#2EC4A6", "#60a5fa", "#fb923c", "#f472b6"];

export function ComparisonChart({ datasets }: ComparisonChartProps) {
  if (datasets.length === 0) {
    return (
      <div
        data-ocid="comparison.empty_state"
        className="rounded-lg border border-border p-8 text-center text-muted-foreground text-sm"
        style={{ background: CARD_BG }}
      >
        Add tickers in the sidebar to compare
      </div>
    );
  }

  // Find the shortest dataset length
  const minLen = Math.min(...datasets.map((d) => d.dates.length));
  const step = Math.max(1, Math.floor(minLen / 120));

  // Build combined chart data with normalized prices (base 100)
  const chartData: Record<string, any>[] = [];
  for (let i = 0; i < minLen; i += step) {
    const row: Record<string, any> = { date: datasets[0].dates[i].slice(5) };
    for (const ds of datasets) {
      const base = ds.closes[0];
      if (base && base > 0) {
        row[ds.ticker] = Math.round((ds.closes[i] / base) * 10000) / 100;
      }
    }
    chartData.push(row);
  }

  return (
    <div
      data-ocid="comparison.card"
      className="rounded-lg border border-border p-4"
      style={{ background: CARD_BG }}
    >
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
        Multi-Stock Comparison
      </p>
      <p className="text-sm font-semibold mb-4">
        Normalized Performance (Base = 100)
      </p>
      <ResponsiveContainer width="100%" height={240}>
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
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              background: BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              fontSize: 11,
            }}
            labelStyle={{ color: MUTED }}
            formatter={(v: any) => [`${v}`, ""]}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: MUTED }} />
          {datasets.map((ds, idx) => (
            <Line
              key={ds.ticker}
              type="monotone"
              dataKey={ds.ticker}
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth={1.5}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
