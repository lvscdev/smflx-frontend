"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const backgroundImage = "/assets/images/sidebar-bg.png";
const logo = "/assets/images/sidebar-logo.png";

interface Step {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface SidebarProps {
  currentStep: number;
  steps: Step[];
  onAlreadyRegistered: () => void;
  hostelSpacesLeft?: number;
}

export function Sidebar({
  currentStep,
  steps,
  onAlreadyRegistered,
  hostelSpacesLeft = 850,
}: SidebarProps) {
  const [mounted, setMounted] = useState(false);

  // ✅ Safe progress calc (prevents NaN)
  const totalSteps = steps?.length ?? 0;
  const completedSteps = totalSteps ? steps.filter((s) => s.completed).length : 0;
  const progressPercentage =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Circle progress
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    progressPercentage <= 0
      ? circumference
      : circumference - (progressPercentage / 100) * circumference;

  const calculateTimeToEvent = () => {
    if (typeof window === "undefined") {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const eventDate = new Date("2026-04-30T00:00:00").getTime();
    const now = new Date().getTime();
    const difference = eventDate - now;

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const [timeToEvent, setTimeToEvent] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);
    setTimeToEvent(calculateTimeToEvent());

    const timer = setInterval(() => {
      setTimeToEvent(calculateTimeToEvent());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    // ✅ Always fill height
    <aside className="w-full lg:w-[42%] relative overflow-hidden flex flex-col h-full">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 42vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-4 lg:p-12">
        <div className="flex items-center justify-between mb-auto">
          <Image
            src={logo}
            alt="SMFLX"
            width={120}
            height={48}
            className="h-8 lg:h-12 w-auto"
            style={{ height: "auto" }}
            priority
          />

          <div className="relative w-14 h-14 lg:w-20 lg:h-20">
            <svg className="transform -rotate-90 w-14 h-14 lg:w-20 lg:h-20">
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="2"
                fill="rgba(255, 255, 255, 0.1)"
                className="lg:hidden"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="2"
                fill="rgba(255, 255, 255, 0.1)"
                className="hidden lg:block"
              />

              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="white"
                strokeWidth="2"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 lg:hidden"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="white"
                strokeWidth="2"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 hidden lg:block"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm lg:text-base font-light">
                {mounted ? `${progressPercentage}%` : "0%"}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8 hidden lg:block">
          <h2 className="text-white leading-tight text-[28px] mb-8 font-bold">
            Welcome to SMFLX
            <br />
            Registration Portal
          </h2>

          {mounted && (
            <div className="flex items-center gap-4 mt-5">
              <div className="flex flex-col items-center">
                <span className="text-white text-6xl font-bold">{timeToEvent.days}</span>
                <span className="text-white text-xs font-light opacity-70 mt-1">days</span>
              </div>
              <span className="text-white text-5xl font-light opacity-50">:</span>
              <div className="flex flex-col items-center">
                <span className="text-white text-6xl font-bold">
                  {String(timeToEvent.hours).padStart(2, "0")}
                </span>
                <span className="text-white text-xs font-light opacity-70 mt-1">hours</span>
              </div>
              <span className="text-white text-5xl font-light opacity-50">:</span>
              <div className="flex flex-col items-center">
                <span className="text-white text-6xl font-bold">
                  {String(timeToEvent.minutes).padStart(2, "0")}
                </span>
                <span className="text-white text-xs font-light opacity-70 mt-1">mins</span>
              </div>
              <span className="text-white text-5xl font-light opacity-50">:</span>
              <div className="flex flex-col items-center">
                <span className="text-white text-6xl font-bold">
                  {String(timeToEvent.seconds).padStart(2, "0")}
                </span>
                <span className="text-white text-xs font-light opacity-70 mt-1">secs</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto hidden lg:block">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/20">
            <p className="text-white text-sm font-light">
              <span className="font-semibold text-[64px]">{hostelSpacesLeft}</span>{" "}
              Hostel Spaces left.
              <br />
              Book your space now.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
