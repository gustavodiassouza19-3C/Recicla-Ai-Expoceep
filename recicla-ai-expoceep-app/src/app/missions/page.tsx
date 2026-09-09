import { Card } from "@/components/ui";

export default function MissionsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-foreground">Missoes</h1>
          <p className="text-muted-foreground mt-2">
            Complete missoes para ganhar pontos extras!
          </p>
        </Card>
      </div>
    </div>
  );
}
