import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, TrendingUp } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TABS = [
  { id: "analysis", label: "Analysis" },
  { id: "backtest", label: "Backtest" },
  { id: "comparison", label: "Comparison" },
  { id: "signals", label: "Signals" },
];

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border"
      style={{ background: "oklch(0.13 0.004 250)" }}
    >
      <div className="flex items-center h-14 px-4 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-base text-foreground tracking-tight">
            Stock<span className="text-primary">z</span>
          </span>
        </div>

        {/* Nav tabs */}
        <nav
          className="flex items-center gap-1 ml-6"
          aria-label="Main navigation"
        >
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab.id}
              data-ocid={`nav.${tab.id}.tab`}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "px-4 py-1.5 text-sm rounded-md font-medium transition-colors",
                activeTab === tab.id
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                JS
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground hidden sm:block">
              J. Smith
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
