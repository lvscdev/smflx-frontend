"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppFloat() {
    const message =
    "Hi SMFLX team! I need help with registration. My email is: [your email].";
  const href = `https://wa.me/2349130365970?text=${encodeURIComponent(message)}`;

  return (
    <a
      href="https://wa.me/2349130365970"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="
        fixed bottom-24 sm:bottom-5 right-4 sm:right-5 z-50
        flex items-center justify-center
        w-14 h-14 rounded-full
        bg-[#25D366] text-white
        shadow-lg hover:shadow-xl
        hover:scale-105 active:scale-95
        transition-all duration-200
      "
    >
      <MessageCircle className="w-7 h-7 animate-bounce animation-duration-[1.8s]" />
    </a>
  );
}

