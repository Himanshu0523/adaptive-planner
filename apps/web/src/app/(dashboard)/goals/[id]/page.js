import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui";
import { GoalTasksPanel } from "@/features/tasks";
import { GoalDetailHeader } from "@/features/goals/components/goal-detail-header";

export default async function GoalDetailPage({ params }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <GoalDetailHeader goalId={id} />
      <GoalTasksPanel goalId={id} />
    </div>
  );
}