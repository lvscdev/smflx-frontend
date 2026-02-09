"use client";

import { Sidebar } from "./Sidebar";


export function LoginLayout({ 
  children, 
  showSidebar = false 
}: { 
  children: React.ReactNode; 
  showSidebar?: boolean; 
}) {
  return (
    <div className="flex flex-col lg:flex-row h-screen w-full">
      {showSidebar && <Sidebar minimal={true} />}
      <div className="flex-1 flex flex-col overflow-y-auto bg-white">
        {children}
      </div>
    </div>
  );
}