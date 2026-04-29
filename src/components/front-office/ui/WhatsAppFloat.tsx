"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppFloat() {
  const message =
    "Hi SMFLX team! I need help with registration. My email is: [your email].";
  const href = `https://wa.me/2349130365970?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="
        fixed bottom-24 sm:bottom-5 right-4 sm:right-5 z-50
        flex items-center gap-3
        pl-4 pr-3 py-3 rounded-full
        bg-[#25D366] text-white
        shadow-lg hover:shadow-xl
        hover:scale-105 active:scale-95
        transition-all duration-200
      "
    >
      <span className="text-sm font-medium whitespace-nowrap leading-none">
        Got questions? Chat with us
      </span>
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        <MessageCircle className="w-5 h-5" />
      </div>
    </a>
  );
}

