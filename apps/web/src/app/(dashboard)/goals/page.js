"use client";

import { useState } from "react";
import { Plus, Search, Target, Sparkles } from "lucide-react";
import { useGoals, useDeleteGoal, GoalWizard } from "@/features/goals";
import { GoalCard } from "@/features/goals/components/goal-card";
import { Button, Input, Card, CardHeader, CardTitle, CardBody, Dialog } from "@/components/ui";
import { Skeleton, EmptyState } from "@/components/feedback";

export default function GoalsPage() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const { data: goals, isLoading, isError, error } = useGoals({
    status: selectedStatus,
  });
  const deleteGoal = useDeleteGoal();

  const filteredGoals = (goals || []).filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || g.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E7E5E0] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Goals & Strategic Objectives
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            What are you trying to achieve? Break long-term vision into realistic, adaptive steps.
          </p>
        </div>

        <Button
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center gap-2 self-start sm:self-auto text-xs"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>New Goal (Guided Coach)</span>
        </Button>
      </div>

      {/* Guided Goal Wizard Dialog */}
      <Dialog
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Guided Goal & Planning Wizard"
        description="A structured, supportive conversation to define what you want to achieve and generate a workable plan."
        maxWidth="max-w-2xl"
      >
        <GoalWizard
          onComplete={() => setIsWizardOpen(false)}
          onCancel={() => setIsWizardOpen(false)}
        />
      </Dialog>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search objectives or categories..."
            className="pl-9 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Goals" },
            { id: "in_progress", label: "In Progress" },
            { id: "completed", label: "Completed" },
            { id: "draft", label: "Draft" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                selectedStatus === tab.id
                  ? "bg-[#2D5A43] text-white shadow-xs"
                  : "bg-white text-stone-600 hover:bg-[#F3F2EE] border border-[#E7E5E0]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Target}
          title="Couldn't load goals"
          description={error?.message || "There was an error communicating with the service."}
        />
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Your next goal can start with one sentence."
          description={
            searchQuery || selectedStatus !== "all"
              ? "No goals matched your filter criteria."
              : "What would you like to accomplish over the next few weeks? Let our planning coach help you structure it."
          }
          action={
            <Button
              onClick={() => setIsWizardOpen(true)}
              className="text-xs flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Create with Guided Wizard</span>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDelete={(id) => deleteGoal.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}