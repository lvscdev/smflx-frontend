import { Button } from "@/components/ui/button";
import { LottiePlayer } from "@/components/ui/lottie-player";

import comingSoonAnimation from "public/animations/coming-soon.json";

type ComingSoonProps = {
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ComingSoon({
  description = "We’re working hard to bring you this feature.",
  actionLabel = "Go back",
  onAction,
}: ComingSoonProps) {
  return (
    <div className="h-full flex items-center justify-center text-center">
      <div className="w-full max-w-xl">
        <LottiePlayer
          animationData={comingSoonAnimation}
          className="mx-auto h-60 w-60"
        />

        <p className="font-medium text-2xl">{description}</p>

        {/* {onAction && (
          <Button className="mt-6" variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        )} */}
      </div>
    </div>
  );
}
