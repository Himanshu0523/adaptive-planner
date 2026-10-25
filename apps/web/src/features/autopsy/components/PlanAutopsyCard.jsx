"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  Layers,
  AlertTriangle,
  RotateCcw,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody, Button } from "@/components/ui";

export function PlanAutopsyCard() {
  const [autopsyData, setAutopsyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunAutopsy = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/plans/autopsy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setAutopsyData(data);
    } catch (err) {
      console.error("Failed to run plan autopsy:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-[#2D5A43]/30 bg-gradient-to-br from-white via-white to-[#F2F7F4] shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[#E7E5E0] gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-[#EAF4EE] text-[#2D5A43] flex items-center justify-center font-bold text-xs">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D5A43] block">
              Rule-Based Slip Diagnostics
            </span>
            <CardTitle className="text-base font-bold text-stone-900">
              Plan Autopsy (Why did the schedule slip?)
            </CardTitle>
          </div>
        </div>

        <Button
          size="sm"
          disabled={isLoading}
          onClick={handleRunAutopsy}
          className="text-xs flex items-center gap-1.5 bg-[#2D5A43] hover:bg-[#1E3A2F]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Analyzing Ledger...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              <span>{autopsyData ? "Re-evaluate Slip" : "Run Plan Autopsy"}</span>
            </>
          )}
        </Button>
      </CardHeader>

      <CardBody className="p-6 space-y-5">
        {!autopsyData ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-xs font-semibold text-stone-800">
              Deterministic Root Cause Classification
            </p>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              Plan Autopsy uses data you already store (timers, blockers, reschedules, capacity ceiling) to classify slip causes into 6 categories with zero judgment—then ranks your recovery paths.
            </p>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            {/* Primary Cause Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white border border-[#E7E5E0] shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Identified Root Cause
                </span>
                <h4 className="text-sm sm:text-base font-bold text-stone-900">
                  {autopsyData.causeLabel}
                </h4>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAF4EE] text-[#2D5A43] border border-[#C6DDD1]">
                Rule Confidence: {Math.round(autopsyData.confidence * 100)}%
              </span>
            </div>

            {/* Evidence Packet & Explanation */}
            <div className="grid gap-4 md:grid-cols-2 text-xs">
              <div className="p-4 rounded-xl bg-white border border-[#E7E5E0] space-y-2.5">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-stone-600" />
                  <span>Evidence Packet (Telemetry):</span>
                </span>
                <ul className="space-y-1.5 text-stone-600 text-[11px]">
                  <li className="flex justify-between border-b border-stone-100 pb-1">
                    <span>Average Estimated Duration:</span>
                    <strong className="text-stone-800">{autopsyData.evidencePacket.estimatedMinutes}m</strong>
                  </li>
                  <li className="flex justify-between border-b border-stone-100 pb-1">
                    <span>Logged Focus / Overrun:</span>
                    <strong className="text-stone-800">{autopsyData.evidencePacket.actualMinutesLogged}m</strong>
                  </li>
                  <li className="flex justify-between border-b border-stone-100 pb-1">
                    <span>Daily Scheduled Workload:</span>
                    <strong className="text-stone-800">{autopsyData.evidencePacket.dailyScheduledMinutes}m</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Safe Focus Ceiling:</span>
                    <strong className="text-stone-800">{autopsyData.evidencePacket.maxCapacity}m</strong>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E7E5E0] space-y-2">
                <span className="font-bold text-[#2D5A43] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Compassionate Explanation:</span>
                </span>
                <p className="text-stone-700 leading-relaxed text-xs">
                  {autopsyData.explanation}
                </p>
              </div>
            </div>

            {/* Ranked Recovery Options */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-stone-900 block">
                Ranked Recovery Options (Tailored to this cause):
              </span>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {autopsyData.rankedRecoveryOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      opt.rank === 1
                        ? "border-[#2D5A43] bg-white ring-1 ring-[#2D5A43]/20 shadow-xs"
                        : "border-[#E7E5E0] bg-[#FAF9F5]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{opt.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          opt.rank === 1
                            ? "bg-[#EAF4EE] text-[#2D5A43]"
                            : "bg-stone-200 text-stone-700"
                        }`}
                      >
                        Rank #{opt.rank}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      {opt.rationale}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <Link href="/recovery">
                  <Button size="sm" className="text-xs bg-[#2D5A43] hover:bg-[#1E3A2F]">
                    <span>Apply Ranked Strategy in Recovery Simulator</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
