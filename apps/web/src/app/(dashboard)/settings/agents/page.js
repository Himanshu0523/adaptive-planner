"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Sliders,
  ChevronLeft,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody, Button } from "@/components/ui";

const INITIAL_AGENTS = [
  {
    id: "goal_decomposer",
    name: "Goal Decomposition Agent",
    description: "Structures high-level goal intents into milestones, task dependencies, and estimate envelopes.",
    tier: "ACT_WITH_NOTIFICATION", // Promoted!
    consecutiveApprovals: 7,
    requiredForPromotion: 5,
    totalApprovals: 18,
    totalRejections: 1,
    lastAction: "Drafted 3 milestones for engineering sprint",
    recentEvents: [
      { type: "approved", text: "Milestones approved without edits", time: "Yesterday" },
      { type: "approved", text: "Task breakdown accepted verbatim", time: "3 days ago" },
      { type: "promoted", text: "Promoted to Act & Notify (5 streak)", time: "5 days ago" },
    ],
  },
  {
    id: "schedule_calibrator",
    name: "Schedule Calibration Agent",
    description: "Recalibrates task dates and buffer slots when focus sessions run longer than anticipated.",
    tier: "PROPOSE_ONLY",
    consecutiveApprovals: 3,
    requiredForPromotion: 5,
    totalApprovals: 9,
    totalRejections: 2,
    lastAction: "Proposed +2 day gentle deadline extension",
    recentEvents: [
      { type: "approved", text: "Buffer shift accepted", time: "2 days ago" },
      { type: "rejected", text: "Rejected weekend evening slot proposal", time: "1 week ago" },
      { type: "demoted", text: "Demoted to Propose Only after rejection", time: "1 week ago" },
    ],
  },
  {
    id: "recovery_proposal",
    name: "Recovery Proposal Agent",
    description: "Calculates the 3 transparent recovery alternatives in Plan Recovery Simulator.",
    tier: "PROPOSE_ONLY",
    consecutiveApprovals: 4,
    requiredForPromotion: 5,
    totalApprovals: 12,
    totalRejections: 0,
    lastAction: "Generated 3 recovery pathways with explicit trade-offs",
    recentEvents: [
      { type: "approved", text: "Option 2 (gentle extension) approved", time: "Yesterday" },
      { type: "approved", text: "Option 1 (prune secondary items) approved", time: "4 days ago" },
    ],
  },
];

export default function AgentTrustLedgerPage() {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = (agentId) => {
    setAgents((prev) =>
      prev.map((agent) => {
        if (agent.id !== agentId) return agent;
        const newStreak = agent.consecutiveApprovals + 1;
        const shouldPromote = newStreak >= agent.requiredForPromotion && agent.tier === "PROPOSE_ONLY";
        const newTier = shouldPromote ? "ACT_WITH_NOTIFICATION" : agent.tier;

        if (shouldPromote) {
          showToast(`🎉 ${agent.name} earned 5 consecutive approvals and was promoted to "Act & Notify"!`);
        } else {
          showToast(`Approved ${agent.name} output without edits (${newStreak}/${agent.requiredForPromotion} towards promotion).`);
        }

        return {
          ...agent,
          tier: newTier,
          consecutiveApprovals: newStreak,
          totalApprovals: agent.totalApprovals + 1,
          recentEvents: [
            { type: shouldPromote ? "promoted" : "approved", text: shouldPromote ? "Promoted to Act & Notify!" : "Approved without edits", time: "Just now" },
            ...agent.recentEvents.slice(0, 3),
          ],
        };
      })
    );
  };

  const handleReject = (agentId) => {
    setAgents((prev) =>
      prev.map((agent) => {
        if (agent.id !== agentId) return agent;
        const wasDemoted = agent.tier === "ACT_WITH_NOTIFICATION";
        showToast(
          wasDemoted
            ? `⚠️ ${agent.name} was rejected and immediately demoted back to "Propose Only".`
            : `${agent.name} output was rejected. Consecutive streak reset to 0.`
        );

        return {
          ...agent,
          tier: "PROPOSE_ONLY",
          consecutiveApprovals: 0,
          totalRejections: agent.totalRejections + 1,
          recentEvents: [
            { type: "rejected", text: wasDemoted ? "Demoted back to Propose Only" : "Proposal rejected", time: "Just now" },
            ...agent.recentEvents.slice(0, 3),
          ],
        };
      })
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Breadcrumb & Header */}
      <div className="border-b border-[#E7E5E0] pb-6 space-y-2">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Back to Settings</span>
        </Link>
        <div>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Agent Governance & Safety
          </span>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Agent Trust Ledger
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Every agent starts as &ldquo;Propose Only&rdquo;. After a run of approvals with no edits, it earns the right to act and notify you. One single rejection demotes it instantly.
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="rounded-xl border border-[#C6DDD1] bg-[#EAF4EE] p-3.5 flex items-center gap-2.5 text-xs font-semibold text-[#2D5A43] shadow-xs animate-in fade-in-0 duration-150">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Policy Callout Banner */}
      <div className="p-4 rounded-xl border border-[#C6DDD1] bg-[#F2F7F4] flex items-start gap-3 text-xs text-stone-700">
        <Shield className="h-4 w-4 text-[#2D5A43] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-[#2D5A43] block">Transparent Promotion & Demotion Rules</span>
          <p className="leading-relaxed text-stone-600">
            Agents never bypass your agency. In <strong>Propose Only</strong>, every tool call pauses for your review. Once an agent proves reliable with <strong>5 consecutive unedited approvals</strong>, it elevates to <strong>Act & Notify</strong>. If you reject a single proposal, it drops right back.
          </p>
        </div>
      </div>

      {/* Agents Ledger Cards */}
      <div className="space-y-5">
        {agents.map((agent) => {
          const isActTier = agent.tier === "ACT_WITH_NOTIFICATION";
          const progressPct = Math.min((agent.consecutiveApprovals / agent.requiredForPromotion) * 100, 100);

          return (
            <Card key={agent.id} className="p-6 space-y-5 border-[#E7E5E0] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E7E5E0]">
                <div>
                  <h3 className="text-base font-bold text-stone-900">{agent.name}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{agent.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      isActTier
                        ? "bg-[#EAF4EE] text-[#2D5A43] border-[#C6DDD1]"
                        : "bg-[#FAF9F5] text-stone-700 border-stone-300"
                    }`}
                  >
                    {isActTier ? "⚡ Act & Notify Tier" : "🛡️ Propose Only Tier"}
                  </span>
                </div>
              </div>

              {/* Metrics & Progress Bar */}
              <div className="grid gap-4 sm:grid-cols-3 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E7E5E0] space-y-1">
                  <span className="text-stone-500 block">Consecutive Approvals</span>
                  <p className="text-base font-extrabold text-stone-900">
                    {agent.consecutiveApprovals}{" "}
                    <span className="text-xs font-normal text-stone-500">
                      / {agent.requiredForPromotion} needed
                    </span>
                  </p>
                  {!isActTier && (
                    <div className="w-full bg-[#E7E5E0] h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-[#2D5A43] h-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E7E5E0] space-y-1">
                  <span className="text-stone-500 block">Lifetime Approvals</span>
                  <p className="text-base font-extrabold text-[#2D5A43]">
                    {agent.totalApprovals} approved
                  </p>
                  <span className="text-[11px] text-stone-400 block">Accepted verbatim</span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E7E5E0] space-y-1">
                  <span className="text-stone-500 block">Lifetime Rejections</span>
                  <p className="text-base font-extrabold text-stone-800">
                    {agent.totalRejections} rejected
                  </p>
                  <span className="text-[11px] text-stone-400 block">Triggered tier demotion</span>
                </div>
              </div>

              {/* Recent Audit Events */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-900 block">
                  Recent Trust & Governance Events:
                </span>
                <div className="divide-y divide-[#E7E5E0] border border-[#E7E5E0] rounded-xl overflow-hidden bg-white text-xs">
                  {agent.recentEvents.map((evt, idx) => (
                    <div key={idx} className="p-2.5 px-3 flex items-center justify-between text-stone-600">
                      <span className="flex items-center gap-2">
                        {evt.type === "approved" && <CheckCircle2 className="h-3.5 w-3.5 text-[#2D5A43]" />}
                        {evt.type === "rejected" && <XCircle className="h-3.5 w-3.5 text-red-500" />}
                        {evt.type === "promoted" && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
                        {evt.type === "demoted" && <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
                        <span>{evt.text}</span>
                      </span>
                      <span className="text-[11px] text-stone-400">{evt.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Governance Controls */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E7E5E0]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReject(agent.id)}
                  className="text-xs text-red-700 hover:bg-red-50 hover:border-red-200"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1 text-red-600" />
                  <span>Reject (Demote to Propose Only)</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(agent.id)}
                  className="text-xs bg-[#2D5A43] hover:bg-[#1E3A2F]"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  <span>Approve Without Edits (+1 Streak)</span>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
