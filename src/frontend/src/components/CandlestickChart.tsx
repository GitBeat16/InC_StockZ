import type { OHLCVData } from "@/utils/dataFetcher";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  type IChartApi,
  LineSeries,
  createChart,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartPoint {
  time: string;
  value: number;
}

interface CandlestickChartProps {
  data: OHLCVData[];
  sma20: (number | null)[];
  sma50: (number | null)[];
  ema20: (number | null)[];
  showSMA20: boolean;
  showSMA50: boolean;
  showEMA20: boolean;
  showRSI: boolean;
  showMACD: boolean;
  rsiData: (number | null)[];
  macdData: {
    macd: (number | null)[];
    signal: (number | null)[];
    histogram: (number | null)[];
  };
}

const BG = "#0F1113";
const CARD_BG = "#1A1D20";
const BORDER = "#2A2F34";
const TEXT = "#E6E8EA";
const MUTED = "#9AA3AA";
const ACCENT = "#2EC4A6";
const BULL = "#27C7A5";
const BEAR = "#E25555";

export function CandlestickChart({
  data,
  sma20,
  sma50,
  ema20,
  showSMA20,
  showSMA50,
  showEMA20,
  showRSI,
  showMACD,
  rsiData,
  macdData,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: CARD_BG },
        textColor: TEXT,
      },
      grid: {
        vertLines: { color: BORDER },
        horzLines: { color: BORDER },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: BORDER },
      timeScale: { borderColor: BORDER, timeVisible: true },
      width: container.clientWidth,
      height: 380,
    });
    chartRef.current = chart;

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: BULL,
      downColor: BEAR,
      borderUpColor: BULL,
      borderDownColor: BEAR,
      wickUpColor: BULL,
      wickDownColor: BEAR,
    });
    candleSeries.setData(
      data.map((d) => ({
        time: d.time as any,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      })),
    );

    // Volume histogram
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: ACCENT,
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeries.setData(
      data.map((d) => ({
        time: d.time as any,
        value: d.volume,
        color: d.close >= d.open ? `${BULL}66` : `${BEAR}66`,
      })),
    );

    // SMA20
    if (showSMA20) {
      const sma20Series = chart.addSeries(LineSeries, {
        color: "#2EC4A6",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      const sma20Points: ChartPoint[] = [];
      data.forEach((d, i) => {
        if (sma20[i] !== null)
          sma20Points.push({ time: d.time, value: sma20[i]! });
      });
      sma20Series.setData(sma20Points as any);
    }

    // SMA50
    if (showSMA50) {
      const sma50Series = chart.addSeries(LineSeries, {
        color: "#60a5fa",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      const sma50Points: ChartPoint[] = [];
      data.forEach((d, i) => {
        if (sma50[i] !== null)
          sma50Points.push({ time: d.time, value: sma50[i]! });
      });
      sma50Series.setData(sma50Points as any);
    }

    // EMA20
    if (showEMA20) {
      const ema20Series = chart.addSeries(LineSeries, {
        color: "#fb923c",
        lineWidth: 1,
        lineStyle: 1, // dashed
        priceLineVisible: false,
        lastValueVisible: false,
      });
      const ema20Points: ChartPoint[] = [];
      data.forEach((d, i) => {
        if (ema20[i] !== null)
          ema20Points.push({ time: d.time, value: ema20[i]! });
      });
      ema20Series.setData(ema20Points as any);
    }

    // Resize observer
    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: container.clientWidth });
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [data, sma20, sma50, ema20, showSMA20, showSMA50, showEMA20]);

  // RSI chart data
  const rsiChartData = data
    .map((d, i) => ({
      date: d.time.slice(5),
      rsi:
        rsiData[i] !== null
          ? Math.round((rsiData[i] as number) * 10) / 10
          : null,
    }))
    .filter((d) => d.rsi !== null);

  // MACD chart data
  const macdChartData = data
    .map((d, i) => ({
      date: d.time.slice(5),
      macd:
        macdData.macd[i] !== null
          ? Math.round((macdData.macd[i] as number) * 1000) / 1000
          : null,
      signal:
        macdData.signal[i] !== null
          ? Math.round((macdData.signal[i] as number) * 1000) / 1000
          : null,
      histogram:
        macdData.histogram[i] !== null
          ? Math.round((macdData.histogram[i] as number) * 1000) / 1000
          : null,
    }))
    .filter((d) => d.macd !== null);

  return (
    <div className="flex flex-col gap-0 rounded-lg overflow-hidden border border-border">
      {/* Indicator legend */}
      <div
        className="flex items-center gap-4 px-4 py-2 border-b border-border"
        style={{ background: "#23272B" }}
      >
        <span className="text-xs font-semibold text-foreground">
          Price Chart
        </span>
        <div className="flex items-center gap-3 ml-2">
          {showSMA20 && (
            <div className="flex items-center gap-1">
              <span
                className="inline-block w-4 h-0.5"
                style={{ background: "#2EC4A6" }}
              />
              <span className="text-[10px] text-muted-foreground">SMA20</span>
            </div>
          )}
          {showSMA50 && (
            <div className="flex items-center gap-1">
              <span
                className="inline-block w-4 h-0.5"
                style={{ background: "#60a5fa" }}
              />
              <span className="text-[10px] text-muted-foreground">SMA50</span>
            </div>
          )}
          {showEMA20 && (
            <div className="flex items-center gap-1">
              <span
                className="inline-block w-4 h-0.5 border-t border-dashed"
                style={{ borderColor: "#fb923c" }}
              />
              <span className="text-[10px] text-muted-foreground">EMA20</span>
            </div>
          )}
        </div>
      </div>

      {/* Main chart */}
      <div
        ref={chartContainerRef}
        data-ocid="chart.canvas_target"
        style={{ background: CARD_BG }}
      />

      {/* RSI subpanel */}
      {showRSI && rsiChartData.length > 0 && (
        <div style={{ background: CARD_BG, borderTop: `1px solid ${BORDER}` }}>
          <div className="px-4 pt-2 pb-0 flex items-center gap-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              RSI (14)
            </span>
            <span className="text-[10px] text-muted-foreground">
              {rsiChartData[rsiChartData.length - 1]?.rsi?.toFixed(1)}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={90}>
            <AreaChart
              data={rsiChartData}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="rsiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: MUTED, fontSize: 9 }}
                tickCount={5}
              />
              <Tooltip
                contentStyle={{
                  background: BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  fontSize: 11,
                }}
                labelStyle={{ color: MUTED }}
                itemStyle={{ color: "#a78bfa" }}
              />
              <ReferenceLine
                y={70}
                stroke={BEAR}
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <ReferenceLine
                y={30}
                stroke={BULL}
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <Area
                type="monotone"
                dataKey="rsi"
                stroke="#a78bfa"
                fill="url(#rsiGrad)"
                strokeWidth={1.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* MACD subpanel */}
      {showMACD && macdChartData.length > 0 && (
        <div style={{ background: CARD_BG, borderTop: `1px solid ${BORDER}` }}>
          <div className="px-4 pt-2 pb-0 flex items-center gap-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              MACD
            </span>
          </div>
          <ResponsiveContainer width="100%" height={90}>
            <ComposedChart
              data={macdChartData}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <XAxis dataKey="date" hide />
              <YAxis tick={{ fill: MUTED, fontSize: 9 }} tickCount={4} />
              <Tooltip
                contentStyle={{
                  background: BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  fontSize: 11,
                }}
                labelStyle={{ color: MUTED }}
              />
              <ReferenceLine y={0} stroke={BORDER} strokeWidth={1} />
              <Bar
                dataKey="histogram"
                fill={ACCENT}
                opacity={0.7}
                radius={[1, 1, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="macd"
                stroke="#60a5fa"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="signal"
                stroke="#f472b6"
                strokeWidth={1.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
