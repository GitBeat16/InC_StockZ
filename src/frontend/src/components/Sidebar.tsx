import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart2, Download, Plus, Search, X } from "lucide-react";
import { useState } from "react";

interface ActiveIndicators {
  sma20: boolean;
  sma50: boolean;
  ema20: boolean;
  rsi: boolean;
  macd: boolean;
}

interface SidebarProps {
  ticker: string;
  setTicker: (t: string) => void;
  range: "6mo" | "1y" | "5y";
  setRange: (r: "6mo" | "1y" | "5y") => void;
  activeIndicators: ActiveIndicators;
  setActiveIndicators: (ind: ActiveIndicators) => void;
  compareMode: boolean;
  setCompareMode: (v: boolean) => void;
  compareTickers: string[];
  setCompareTickers: (t: string[]) => void;
  onExport: () => void;
}

const RANGES: { label: string; value: "6mo" | "1y" | "5y" }[] = [
  { label: "6M", value: "6mo" },
  { label: "1Y", value: "1y" },
  { label: "5Y", value: "5y" },
];

const INDICATORS: {
  key: keyof ActiveIndicators;
  label: string;
  color: string;
}[] = [
  { key: "sma20", label: "SMA 20", color: "#2ec4a6" },
  { key: "sma50", label: "SMA 50", color: "#60a5fa" },
  { key: "ema20", label: "EMA 20", color: "#fb923c" },
  { key: "rsi", label: "RSI (14)", color: "#a78bfa" },
  { key: "macd", label: "MACD", color: "#f472b6" },
];

export function Sidebar({
  ticker,
  setTicker,
  range,
  setRange,
  activeIndicators,
  setActiveIndicators,
  compareMode,
  setCompareMode,
  compareTickers,
  setCompareTickers,
  onExport,
}: SidebarProps) {
  const [inputVal, setInputVal] = useState(ticker);
  const [compareInput, setCompareInput] = useState("");

  const handleSearch = () => {
    const t = inputVal.trim().toUpperCase();
    if (t) setTicker(t);
  };

  const addCompareTicker = () => {
    const t = compareInput.trim().toUpperCase();
    if (t && compareTickers.length < 2 && !compareTickers.includes(t)) {
      setCompareTickers([...compareTickers, t]);
      setCompareInput("");
    }
  };

  const removeCompareTicker = (t: string) => {
    setCompareTickers(compareTickers.filter((x) => x !== t));
  };

  const toggleIndicator = (key: keyof ActiveIndicators) => {
    setActiveIndicators({ ...activeIndicators, [key]: !activeIndicators[key] });
  };

  return (
    <aside
      className="w-60 shrink-0 border-r border-border flex flex-col gap-0 overflow-y-auto"
      style={{ background: "oklch(0.14 0.004 250)" }}
    >
      {/* Ticker Input */}
      <div className="p-4 border-b border-border">
        <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">
          Ticker
        </p>
        <div className="flex gap-2">
          <Input
            data-ocid="sidebar.ticker.input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="e.g. AAPL"
            className="h-8 text-sm bg-secondary border-border font-mono"
          />
          <Button
            data-ocid="sidebar.ticker.submit_button"
            size="sm"
            className="h-8 px-2 shrink-0"
            onClick={handleSearch}
          >
            <Search className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Timeframe */}
      <div className="p-4 border-b border-border">
        <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">
          Timeframe
        </p>
        <div className="flex gap-1.5">
          {RANGES.map((r) => (
            <button
              type="button"
              key={r.value}
              data-ocid={`sidebar.range.${r.value}.toggle`}
              onClick={() => setRange(r.value)}
              className={[
                "flex-1 py-1.5 text-xs font-medium rounded transition-colors",
                range === r.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent/20",
              ].join(" ")}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Indicators */}
      <div className="p-4 border-b border-border">
        <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">
          Indicators
        </p>
        <div className="flex flex-col gap-2.5">
          {INDICATORS.map((ind) => (
            <div key={ind.key} className="flex items-center gap-2.5">
              <Checkbox
                id={`ind-${ind.key}`}
                data-ocid={`sidebar.${ind.key}.checkbox`}
                checked={activeIndicators[ind.key]}
                onCheckedChange={() => toggleIndicator(ind.key)}
                className="w-3.5 h-3.5"
              />
              <Label
                htmlFor={`ind-${ind.key}`}
                className="text-xs cursor-pointer flex items-center gap-1.5"
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: ind.color }}
                />
                {ind.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Compare */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
            Compare
          </p>
          <button
            type="button"
            data-ocid="sidebar.compare.toggle"
            onClick={() => setCompareMode(!compareMode)}
            className={[
              "text-[10px] font-medium px-2 py-0.5 rounded transition-colors",
              compareMode
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground",
            ].join(" ")}
          >
            {compareMode ? "ON" : "OFF"}
          </button>
        </div>
        {compareMode && (
          <>
            <div className="flex gap-1.5 mb-2">
              <Input
                data-ocid="sidebar.compare.input"
                value={compareInput}
                onChange={(e) => setCompareInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCompareTicker()}
                placeholder="Add ticker"
                className="h-7 text-xs bg-secondary border-border font-mono"
              />
              <Button
                data-ocid="sidebar.compare.add_button"
                size="sm"
                className="h-7 px-2 shrink-0"
                onClick={addCompareTicker}
                disabled={compareTickers.length >= 2}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {compareTickers.map((t) => (
                <Badge
                  key={t}
                  className="text-[10px] font-mono gap-1 bg-primary/20 text-primary border-primary/30 cursor-pointer hover:bg-destructive/20 hover:text-destructive hover:border-destructive/30"
                  onClick={() => removeCompareTicker(t)}
                >
                  {t} <X className="w-2.5 h-2.5" />
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Tools */}
      <div className="p-4">
        <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">
          Tools
        </p>
        <Button
          data-ocid="sidebar.export.button"
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs gap-2 bg-secondary border-border hover:bg-accent/20"
          onClick={onExport}
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs gap-2 mt-2 bg-secondary border-border hover:bg-accent/20"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Full Screen
        </Button>
      </div>
    </aside>
  );
}
