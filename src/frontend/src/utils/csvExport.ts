import type { OHLCVData } from "./dataFetcher";

export function exportToCSV(data: OHLCVData[], ticker: string): void {
  const headers = ["Date", "Open", "High", "Low", "Close", "Volume"];
  const rows = data.map((d) =>
    [d.time, d.open, d.high, d.low, d.close, d.volume].join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${ticker}_historical_data.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
