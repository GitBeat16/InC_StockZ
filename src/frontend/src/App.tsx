import { BacktestResults } from "@/components/BacktestResults";
import { CandlestickChart } from "@/components/CandlestickChart";
import { ComparisonChart } from "@/components/ComparisonChart";
import { Header } from "@/components/Header";
import { MetricsCard } from "@/components/MetricsCard";
import { PredictionChart } from "@/components/PredictionChart";
import { Sidebar } from "@/components/Sidebar";
import { runBacktest } from "@/utils/backtesting";
import { exportToCSV } from "@/utils/csvExport";
import { type OHLCVData, fetchStockData } from "@/utils/dataFetcher";
import {
  calcEMA,
  calcMACD,
  calcRSI,
  calcSMA,
  getSignal,
} from "@/utils/indicators";
import { linearRegression } from "@/utils/prediction";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface ActiveIndicators {
  sma20: boolean;
  sma50: boolean;
  ema20: boolean;
  rsi: boolean;
  macd: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("analysis");
  const [ticker, setTicker] = useState("AAPL");
  const [range, setRange] = useState<"6mo" | "1y" | "5y">("1y");
  const [activeIndicators, setActiveIndicators] = useState<ActiveIndicators>({
    sma20: true,
    sma50: true,
    ema20: false,
    rsi: true,
    macd: false,
  });
  const [compareMode, setCompareMode] = useState(false);
  const [compareTickers, setCompareTickers] = useState<string[]>([]);

  const [stockData, setStockData] = useState<OHLCVData[]>([]);
  const [compareData, setCompareData] = useState<Record<string, OHLCVData[]>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchStockData(ticker, range)
      .then((data) => {
        if (!cancelled) {
          setStockData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(`Failed to load ${ticker}: ${err.message}`);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [ticker, range]);

  useEffect(() => {
    if (!compareMode || compareTickers.length === 0) {
      setCompareData({});
      return;
    }
    Promise.all(
      compareTickers.map((t) =>
        fetchStockData(t, range).then((data) => ({ ticker: t, data })),
      ),
    ).then((results) => {
      const map: Record<string, OHLCVData[]> = {};
      for (const r of results) map[r.ticker] = r.data;
      setCompareData(map);
    });
  }, [compareMode, compareTickers, range]);

  const closes = stockData.map((d) => d.close);
  const sma20 = calcSMA(closes, 20);
  const sma50 = calcSMA(closes, 50);
  const ema20 = calcEMA(closes, 20);
  const rsiValues = calcRSI(closes, 14);
  const macdValues = calcMACD(closes);
  const signal = getSignal(closes, rsiValues);
  const prediction = closes.length > 2 ? linearRegression(closes) : null;
  const backtest = runBacktest(stockData);

  const lastClose = closes[closes.length - 1] ?? 0;
  const prevClose = closes[closes.length - 2] ?? lastClose;
  const priceChange = lastClose - prevClose;
  const priceChangePct = prevClose > 0 ? (priceChange / prevClose) * 100 : 0;
  const lastRSI = rsiValues[rsiValues.length - 1];
  const lastVolume = stockData[stockData.length - 1]?.volume ?? 0;

  const dates = stockData.map((d) => d.time);

  const comparisonDatasets = compareMode
    ? [
        { ticker, dates, closes },
        ...compareTickers
          .filter((t) => compareData[t])
          .map((t) => ({
            ticker: t,
            dates: compareData[t].map((d) => d.time),
            closes: compareData[t].map((d) => d.close),
          })),
      ]
    : [];

  const showAnalysis = activeTab === "analysis" || activeTab === "signals";
  const showBacktest = activeTab === "backtest" || activeTab === "analysis";
  const showComparison = activeTab === "comparison";

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchStockData(ticker, range)
      .then(setStockData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0F1113", color: "#E6E8EA" }}
    >
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          ticker={ticker}
          setTicker={setTicker}
          range={range}
          setRange={setRange}
          activeIndicators={activeIndicators}
          setActiveIndicators={setActiveIndicators}
          compareMode={compareMode}
          setCompareMode={setCompareMode}
          compareTickers={compareTickers}
          setCompareTickers={setCompareTickers}
          onExport={() => exportToCSV(stockData, ticker)}
        />

        <main className="flex-1 overflow-auto p-4">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                data-ocid="app.loading_state"
                className="flex flex-col items-center justify-center h-64 gap-3"
              >
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Fetching {ticker} data…
                </p>
              </motion.div>
            )}

            {!loading && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                data-ocid="app.error_state"
                className="flex flex-col items-center justify-center h-64 gap-3"
              >
                <AlertCircle className="w-8 h-8 text-destructive" />
                <p className="text-sm text-muted-foreground max-w-sm text-center">
                  {error}
                </p>
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  onClick={handleRetry}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </button>
              </motion.div>
            )}

            {!loading && !error && stockData.length > 0 && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h1 className="text-lg font-bold font-mono">{ticker}</h1>
                    <span
                      className={`text-sm font-mono ${
                        priceChange >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      ${lastClose.toFixed(2)}
                      <span className="ml-1 text-xs">
                        ({priceChange >= 0 ? "+" : ""}
                        {priceChangePct.toFixed(2)}%)
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stockData.length} trading days · Last:{" "}
                    {dates[dates.length - 1]}
                  </p>
                </div>

                {showComparison && (
                  <ComparisonChart datasets={comparisonDatasets} />
                )}

                {!showComparison && showAnalysis && (
                  <div
                    className="grid gap-4"
                    style={{ gridTemplateColumns: "1fr 300px" }}
                  >
                    <div className="flex flex-col gap-4">
                      <CandlestickChart
                        data={stockData}
                        sma20={sma20}
                        sma50={sma50}
                        ema20={ema20}
                        showSMA20={activeIndicators.sma20}
                        showSMA50={activeIndicators.sma50}
                        showEMA20={activeIndicators.ema20}
                        showRSI={activeIndicators.rsi}
                        showMACD={activeIndicators.macd}
                        rsiData={rsiValues}
                        macdData={macdValues}
                      />
                      {prediction && (
                        <PredictionChart
                          dates={dates}
                          closes={closes}
                          predicted={prediction.predicted}
                          nextDayPrediction={prediction.nextDayPrediction}
                          slope={prediction.slope}
                        />
                      )}
                      {showBacktest && <BacktestResults result={backtest} />}
                    </div>

                    <div className="flex flex-col gap-4">
                      <MetricsCard
                        ticker={ticker}
                        lastClose={lastClose}
                        priceChange={priceChange}
                        priceChangePct={priceChangePct}
                        signal={signal}
                        rsiValue={lastRSI ?? null}
                        volume={lastVolume}
                      />
                      <div
                        className="rounded-lg border border-border p-4"
                        style={{ background: "oklch(0.155 0.004 250)" }}
                      >
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
                          Analysis
                        </p>
                        <div className="flex flex-col gap-2.5">
                          <AnalysisRow
                            label="SMA 20"
                            value={sma20[sma20.length - 1]?.toFixed(2) ?? "—"}
                            prefix="$"
                          />
                          <AnalysisRow
                            label="SMA 50"
                            value={sma50[sma50.length - 1]?.toFixed(2) ?? "—"}
                            prefix="$"
                          />
                          <AnalysisRow
                            label="EMA 20"
                            value={ema20[ema20.length - 1]?.toFixed(2) ?? "—"}
                            prefix="$"
                          />
                          <AnalysisRow
                            label="52W High"
                            value={Math.max(...closes.slice(-252)).toFixed(2)}
                            prefix="$"
                          />
                          <AnalysisRow
                            label="52W Low"
                            value={Math.min(...closes.slice(-252)).toFixed(2)}
                            prefix="$"
                          />
                        </div>
                      </div>

                      <div
                        className="rounded-lg border border-border p-4"
                        style={{ background: "oklch(0.155 0.004 250)" }}
                      >
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
                          Backtest Summary
                        </p>
                        <div className="flex flex-col gap-2.5">
                          <AnalysisRow
                            label="Total Return"
                            value={`${backtest.totalReturn >= 0 ? "+" : ""}${backtest.totalReturn.toFixed(2)}%`}
                            highlight={
                              backtest.totalReturn >= 0 ? "green" : "red"
                            }
                          />
                          <AnalysisRow
                            label="Sharpe Ratio"
                            value={backtest.sharpeRatio.toFixed(2)}
                          />
                          <AnalysisRow
                            label="Win Rate"
                            value={`${backtest.winRate.toFixed(1)}%`}
                          />
                          <AnalysisRow
                            label="Total Trades"
                            value={backtest.totalTrades.toString()}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {!loading && !error && stockData.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                data-ocid="app.empty_state"
                className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground"
              >
                <p className="text-sm">Enter a ticker symbol to get started</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <footer
        className="border-t border-border py-3 px-6 flex items-center justify-between"
        style={{ background: "oklch(0.13 0.004 250)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary">Stockz</span>
          <span className="text-xs text-muted-foreground">
            Real-time Stock Analysis
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

function AnalysisRow({
  label,
  value,
  prefix = "",
  highlight,
}: {
  label: string;
  value: string;
  prefix?: string;
  highlight?: "green" | "red";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`text-xs font-mono font-semibold ${
          highlight === "green"
            ? "text-emerald-400"
            : highlight === "red"
              ? "text-red-400"
              : "text-foreground"
        }`}
      >
        {prefix}
        {value}
      </span>
    </div>
  );
}
