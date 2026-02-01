import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function RegistrationDetailsModal({
  registration,
  open,
  onClose,
}: any) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Registration Details</DialogTitle>
        <pre>{JSON.stringify(registration, null, 2)}</pre>
      </DialogContent>
    </Dialog>
  );
}
