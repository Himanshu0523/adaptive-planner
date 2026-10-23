"use client";

import { useState } from "react";
import { User, Bell, Sliders, RotateCcw, Check, Calendar, Globe, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody, Button, Input } from "@/components/ui";
import { useAuthStore } from "@/features/auth/stores/auth-store";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [saved, setSaved] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const [name, setName] = useState(user?.name || "Alex Morgan");
  const [email, setEmail] = useState(user?.email || "demo@adaptiveplanner.io");
  const [timezone, setTimezone] = useState("America/New_York (UTC-5)");
  const [workHours, setWorkHours] = useState("09:00 - 17:00");
  const [defaultDuration, setDefaultDuration] = useState("30");
  const [bufferTime, setBufferTime] = useState("15");

  const [notifications, setNotifications] = useState({
    dailyBriefing: true,
    taskReminders: true,
    adaptiveRescheduling: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleResetDemoData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adaptive_planner_local_goals");
      localStorage.removeItem("adaptive_planner_local_tasks");
      setResetMessage("Demo storage reset. Refresh to load initial template data.");
      setTimeout(() => setResetMessage(""), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-[#E7E5E0] pb-6">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
          Configuration
        </span>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
          Planner & Account Settings
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Configure working hours, availability buffers, notification preferences, and privacy controls.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader className="flex items-center gap-2 border-b border-[#E7E5E0]">
            <User className="h-4 w-4 text-[#2D5A43]" />
            <CardTitle className="text-sm font-semibold text-stone-900">
              Profile & Identity
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Full Name
                </label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Email Address
                </label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-stone-400" />
                <span>Primary Timezone</span>
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-10 rounded-xl border border-[#E7E5E0] bg-white px-3.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/30"
              >
                <option>America/New_York (UTC-5)</option>
                <option>America/Los_Angeles (UTC-8)</option>
                <option>America/Chicago (UTC-6)</option>
                <option>Europe/London (UTC+0)</option>
                <option>Europe/Berlin (UTC+1)</option>
                <option>Asia/Tokyo (UTC+9)</option>
                <option>Asia/Kolkata (UTC+5:30)</option>
              </select>
            </div>
          </CardBody>
        </Card>

        {/* Capacity & Working Hours */}
        <Card>
          <CardHeader className="flex items-center gap-2 border-b border-[#E7E5E0]">
            <Sliders className="h-4 w-4 text-[#2D5A43]" />
            <CardTitle className="text-sm font-semibold text-stone-900">
              Capacity & Availability Constraints
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Working Hours Window
                </label>
                <Input
                  value={workHours}
                  onChange={(e) => setWorkHours(e.target.value)}
                  placeholder="09:00 - 17:00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Default Task Estimate (Mins)
                </label>
                <Input
                  type="number"
                  value={defaultDuration}
                  onChange={(e) => setDefaultDuration(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Inter-Task Buffer (Mins)
                </label>
                <Input
                  type="number"
                  value={bufferTime}
                  onChange={(e) => setBufferTime(e.target.value)}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Notifications & Gentle Alerts */}
        <Card>
          <CardHeader className="flex items-center gap-2 border-b border-[#E7E5E0]">
            <Bell className="h-4 w-4 text-[#2D5A43]" />
            <CardTitle className="text-sm font-semibold text-stone-900">
              Human-Centered Notifications
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {[
              {
                id: "dailyBriefing",
                title: "Morning Daily Briefing",
                desc: "Supportive overview of today's focus tasks delivered at 8:30 AM without guilt language.",
              },
              {
                id: "adaptiveRescheduling",
                title: "Adaptive Reschedule Alerts",
                desc: "Notification when unfinished tasks can be shifted into future open slots with one click.",
              },
              {
                id: "taskReminders",
                title: "Gentle Focus Reminders",
                desc: "Discreet prompt 10 minutes before an scheduled focus block.",
              },
            ].map(({ id, title, desc }) => (
              <label
                key={id}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#FAF9F5] transition cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={notifications[id]}
                  onChange={(e) =>
                    setNotifications({ ...notifications, [id]: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 rounded border-[#E7E5E0] text-[#2D5A43] focus:ring-[#2D5A43]"
                />
                <div>
                  <p className="text-xs font-semibold text-stone-900">{title}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
                </div>
              </label>
            ))}
          </CardBody>
        </Card>

        {/* Data & Privacy Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleResetDemoData}
            className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-red-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo Storage</span>
          </Button>

          <Button
            type="submit"
            className="flex items-center gap-1.5 bg-[#2D5A43] hover:bg-[#1E3A2F] text-white"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                <span>Preferences Saved</span>
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </div>

        {resetMessage && (
          <p className="text-xs text-[#2D5A43] font-medium text-center sm:text-left">{resetMessage}</p>
        )}
      </form>
    </div>
  );
}