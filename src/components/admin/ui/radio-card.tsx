import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

type RadioCardProps = {
  selected: boolean;
  label: string;
  description?: string;
  onClick: () => void;
};

export function RadioCard({
  selected,
  label,
  description,
  onClick,
}: RadioCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full rounded-xl border p-4 text-left transition",
        selected
          ? "border-brand-blue-500 bg-brand-blue-50"
          : "border-slate-200 hover:border-slate-300",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{label}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {selected && <CheckCircle className="h-5 w-5 text-brand-blue-500" />}
      </div>
    </button>
  );
}
