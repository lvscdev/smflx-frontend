import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function EmptyState() {
  return (
    <Card className="mx-auto max-w-md rounded-2xl">
      <CardContent className="space-y-4 p-6 text-center">
        <div className="mx-auto h-40 w-40 rounded-lg bg-muted" />
        <h3 className="text-lg font-semibold">
          Start Managing Your Events Effortlessly
        </h3>
        <p className="text-sm text-muted-foreground">
          You don’t have any events yet. Create your first event to organize
          schedules, track details, and manage everything in one place.
        </p>
        <Button className="w-full">Create Event</Button>
      </CardContent>
    </Card>
  );
}

export { EmptyState };
