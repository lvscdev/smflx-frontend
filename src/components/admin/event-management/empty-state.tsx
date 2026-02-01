import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreateEventModal } from "./create-event-modal";

function EmptyState() {
  return (
    <Card className="mx-auto max-w-md rounded-2xl bg-slate-100 border-slate-300">
      <CardContent className="space-y-4 p-6 text-center">
        <div className="mx-auto h-40 w-40 rounded-lg bg-muted" />
        <h3 className="text-lg font-semibold">
          Start Managing Your Events Effortlessly
        </h3>
        <p className="text-sm text-muted-foreground">
          You don’t have any events yet. Create your first event to organize
          schedules, track details, and manage everything in one place.
        </p>
        <CreateEventModal>
          <Button className="w-full bg-brand-red hover:bg-brand-red/90">
            Create Event
          </Button>
        </CreateEventModal>
      </CardContent>
    </Card>
  );
}

export { EmptyState };
