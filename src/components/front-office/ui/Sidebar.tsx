"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getHostelUnoccupiedCapacity } from "@/lib/api/accommodations";

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

export function Sidebar({ currentStep, steps, onAlreadyRegistered, hostelSpacesLeft }: SidebarProps) {
  const [hostelSpacesLeftFallback, setHostelSpacesLeftFallback] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    if (typeof hostelSpacesLeft === "number") return;

    let cancelled = false;

    (async () => {
      try {
        const left = await getHostelUnoccupiedCapacity();
        if (!cancelled && typeof left === "number") {
          setHostelSpacesLeftFallback(left);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hostelSpacesLeft]);

  const hostelLeft =
    typeof hostelSpacesLeft === "number"
      ? hostelSpacesLeft
      : hostelSpacesLeftFallback;

  // Calculate progress percentage
  const completedSteps = steps.filter((step) => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  
  // Calculate circle progress (circumference based on radius)
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    progressPercentage <= 0
      ? circumference
      : circumference - (progressPercentage / 100) * circumference;

  // Calculate days to event
  const [timeToEvent, setTimeToEvent] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeToEvent = () => {
      const eventDate = new Date(
        process.env.NEXT_PUBLIC_EVENT_START_DATE || '2026-04-30T00:00:00'
      ).getTime();
      const now = new Date().getTime();
      const difference = eventDate - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        };
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeToEvent(calculateTimeToEvent());

    // Update every second
    const timer = setInterval(() => {
      setTimeToEvent(calculateTimeToEvent());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full lg:w-[42%] relative overflow-hidden flex flex-col shrink-0 h-auto lg:h-full self-stretch">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image src={backgroundImage} alt="" fill priority className="object-cover" />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col h-full p-4 lg:p-12">
        {/* Header with Logo and Progress Circle */}
        <div className="flex items-center justify-between mb-auto">
          <Image src={logo} alt="SMFLX" width={180} height={48} className="h-8 lg:h-12 w-auto" />
          
          {/* Circular Progress Indicator */}
          <div className="relative w-14 h-14 lg:w-20 lg:h-20">
            <svg className="transform -rotate-90 w-14 h-14 lg:w-20 lg:h-20">
              {/* Background circle */}
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
              {/* Progress circle */}
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
            {/* Percentage Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm lg:text-base font-light">{progressPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="mb-8 hidden lg:block">
          <h2 className="text-white leading-tight text-[28px] mb-8 -translate-y-[80%] pt-[0px] pb-[0px] pl-[0px] pr-[16px] font-bold">
            Welcome to SMFLX<br />
            Registration Portal
          </h2>

          {/* Minimal Countdown Timer */}
          <div className="flex items-center gap-4 mt-[20px] mr-[0px] mb-[0px] ml-[0px] m-[0px] -translate-y-[20%]">
            <div className="flex flex-col items-center">
              <span className="text-white text-6xl font-bold">{timeToEvent.days}</span>
              <span className="text-white text-xs font-light opacity-70 mt-1">days</span>
            </div>
            <span className="text-white text-5xl font-light opacity-50">:</span>
            <div className="flex flex-col items-center">
              <span className="text-white text-6xl font-bold">{String(timeToEvent.hours).padStart(2, '0')}</span>
              <span className="text-white text-xs font-light opacity-70 mt-1">hours</span>
            </div>
            <span className="text-white text-5xl font-light opacity-50">:</span>
            <div className="flex flex-col items-center">
              <span className="text-white text-6xl font-bold">{String(timeToEvent.minutes).padStart(2, '0')}</span>
              <span className="text-white text-xs font-light opacity-70 mt-1">mins</span>
            </div>
            <span className="text-white text-5xl font-light opacity-50">:</span>
            <div className="flex flex-col items-center">
              <span className="text-white text-6xl font-bold">{String(timeToEvent.seconds).padStart(2, '0')}</span>
              <span className="text-white text-xs font-light opacity-70 mt-1">secs</span>
            </div>
          </div>
        </div>

        {/* Hostel Availability Info at Bottom */}
        <div className="mt-auto hidden lg:block">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/20">
            <p className="text-white text-sm font-light">
              <span className="font-semibold text-[64px]">{hostelLeft ?? 'Limited'}</span> Hostel Spaces left.<br />
              Book your space now.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}