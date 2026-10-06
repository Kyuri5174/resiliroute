"use client";

import { useLocale } from "@/components/locale-provider";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  Gauge,
  Minus,
  ShieldCheck,
  Waypoints,
} from "lucide-react";
import { InfoTip } from "@/components/ui";
import { formatNumber, percentChange, signed } from "@/lib/format";
import { resilienceLabel } from "@/lib/metrics/metrics";
import type { SimulationMetrics } from "@/types/network";

const metrics = [
  {
    key: "averageTravelTime",
    label: "Avg. travel time",
    unit: "min",
    icon: Clock3,
    higherBetter: false,
    explanation:
      "Demand-weighted time across assigned routes. Disconnected trips receive a stated 60-minute penalty.",
  },
  {
    key: "accessibility",
    label: "Essential access",
    unit: "%",
    icon: Waypoints,
    higherBetter: true,
    explanation:
      "Population-weighted access to at least one hospital within 20 min, shelter within 15 min, and station within 12 min.",
  },
  {
    key: "networkEfficiency",
    label: "Network efficiency",
    unit: "/ 100",
    icon: Activity,
    higherBetter: true,
    explanation:
      "Demand-weighted harmonic index: 100 × mean of 10/(10 + shortest trip time). Unreachable pairs contribute zero.",
  },
  {
    key: "congestion",
    label: "Congestion delay",
    unit: "%",
    icon: Gauge,
    higherBetter: false,
    explanation:
      "Extra assigned person-minutes caused by the BPR congestion function, relative to free-flow person-minutes. Change is in percentage points.",
  },
  {
    key: "resilienceScore",
    label: "Resilience score",
    unit: "/ 100",
    icon: ShieldCheck,
    higherBetter: true,
    explanation:
      "Weighted squared retention of accessibility, efficiency, travel time and connected demand. The normal baseline is 100 by definition.",
  },
] as const;

export function MetricCards({
  before,
  after,
}: {
  before: SimulationMetrics;
  after: SimulationMetrics;
}) {
  const { t } = useLocale();

  return (
    <div className="metric-grid" aria-label={t("Before and after impact metrics")}>
      {metrics.map(({ key, label, unit, icon: Icon, higherBetter, explanation }) => {
        const delta = after[key] - before[key];
        const unchanged = Math.abs(delta) < 0.05;
        const adverse = !unchanged && (higherBetter ? delta < 0 : delta > 0);
        const DeltaIcon = unchanged ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;
        return (
          <article
            className={`metric-card ${key === "resilienceScore" ? "resilience-card" : ""}`}
            key={key}
            data-testid={`metric-${key}`}
          >
            <div className="metric-title">
              <Icon size={15} />
              <span>{t(label)}</span>
              <InfoTip label={t(label)} text={explanation} />
            </div>
            <div className="metric-value">
              <span data-testid={`value-${key}`} key={formatNumber(after[key])}>
                {formatNumber(after[key], key === "resilienceScore" ? 0 : 1)}
              </span>
              <small>{t(unit)}</small>
            </div>
            <div className="metric-baseline">
              {t("Baseline")}{" "}
              <strong>
                {formatNumber(before[key], key === "resilienceScore" ? 0 : 1)}
                {unit === "%" ? "%" : unit === "min" ? t(" min") : ""}
              </strong>
              <span className={`delta ${unchanged ? "neutral" : adverse ? "adverse" : "positive"}`}>
                <DeltaIcon size={13} />
                {unchanged
                  ? t("No change")
                  : `${signed(delta)} ${t(key === "averageTravelTime" ? "min" : "pts")}`}
              </span>
            </div>
            <div className="metric-footnote">
              {key === "resilienceScore" ? (
                <>
                  <span className={`status-dot ${after[key] < 80 ? "warning" : ""}`} />
                  {t(resilienceLabel(after[key]))} {t(" · baseline-relative")}
                </>
              ) : (
                t("{change}% relative change", {
                  change: signed(percentChange(before[key], after[key])),
                })
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
