"use client";

import Lottie from "lottie-react";

type LottiePlayerProps = {
  animationData: object;
  className?: string;
};

export function LottiePlayer({ animationData, className }: LottiePlayerProps) {
  return (
    <Lottie animationData={animationData} loop autoplay className={className} />
  );
}
