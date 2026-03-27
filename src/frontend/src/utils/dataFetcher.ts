export interface OHLCVData {
  time: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function tsToDate(ts: number): string {
  const d = new Date(ts * 1000);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseYahooResponse(json: any): OHLCVData[] {
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error("Invalid Yahoo Finance response");
  const timestamps: number[] = result.timestamp ?? [];
  const quote = result.indicators?.quote?.[0] ?? {};
  const opens: number[] = quote.open ?? [];
  const highs: number[] = quote.high ?? [];
  const lows: number[] = quote.low ?? [];
  const closes: number[] = quote.close ?? [];
  const volumes: number[] = quote.volume ?? [];

  const data: OHLCVData[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    if (
      opens[i] == null ||
      highs[i] == null ||
      lows[i] == null ||
      closes[i] == null
    )
      continue;
    data.push({
      time: tsToDate(timestamps[i]),
      open: opens[i],
      high: highs[i],
      low: lows[i],
      close: closes[i],
      volume: volumes[i] ?? 0,
    });
  }
  return data.sort((a, b) => (a.time < b.time ? -1 : 1));
}

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart/";
const ALLORIGINS = "https://api.allorigins.win/get?url=";
const CORSPROXY = "https://corsproxy.io/?url=";

export async function fetchStockData(
  ticker: string,
  range: "6mo" | "1y" | "5y",
): Promise<OHLCVData[]> {
  const url = `${YAHOO_BASE}${encodeURIComponent(ticker)}?interval=1d&range=${range}`;

  // Try direct fetch first
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const json = await res.json();
      return parseYahooResponse(json);
    }
  } catch {
    // CORS blocked, fall through to proxies
  }

  // Try corsproxy.io
  try {
    const proxyUrl = `${CORSPROXY}${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, {
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) {
      const json = await res.json();
      return parseYahooResponse(json);
    }
  } catch {
    // fall through
  }

  // Try allorigins.win
  const originsUrl = `${ALLORIGINS}${encodeURIComponent(url)}`;
  const res = await fetch(originsUrl, {
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const wrapper = await res.json();
  const json = JSON.parse(wrapper.contents);
  return parseYahooResponse(json);
}
