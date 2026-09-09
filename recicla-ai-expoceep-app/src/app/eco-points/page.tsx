import { Card } from "@/components/ui";
import { EcoPointsCard } from "@/components/dashboard/eco-points-card";

export default function EcoPointsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="p-4">
          <EcoPointsCard />
        </Card>
      </div>
    </div>
  );
}
